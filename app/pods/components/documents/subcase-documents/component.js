import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';
import { all } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { A } from '@ember/array';
import moment from 'moment';
import config from 'fe-redpencil/utils/config';
import {
  destroyApprovalsOfAgendaitem, setNotYetFormallyOk
} from 'fe-redpencil/utils/agendaitem-utils';
import { addDocumentToAgendaitem } from 'fe-redpencil/utils/documents';

export default class SubcaseDocuments extends Component {
  @service currentSession;
  @service store;

  @tracked isEnabledDocumentEdit = false;
  @tracked isOpenDocumentUploadModal = false;
  @tracked isOpenLinkedDocumentModal = false;
  @tracked defaultAccessLevel;
  @tracked documents = A([]);
  @tracked newDocuments = A([]);

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @task
  *loadData() {
    this.defaultAccessLevel = this.store.peekRecord('access-level', config.internRegeringAccessLevelId);
    if (!this.defaultAccessLevel) {
      const accessLevels = yield this.store.query('access-level', {
        page: { size: 1 },
        'filter[:id:]': config.internRegeringAccessLevelId
      });
      this.defaultAccessLevel = accessLevels.firstObject;
    }

    this.documents = yield this.args.agendaitemOrSubcase.documentVersions; // TODO replace with query?
  }

  get itemType() {
    return this.args.agendaitemOrSubcase && this.args.agendaitemOrSubcase.constructor.modelName;
  }

  get governmentCanViewDocuments() {
    const isAgendaitem = this.itemType === 'agendaitem';
    const isSubcase = this.itemType === 'subcase';
    const isOverheid = this.currentSession.isOverheid;

    if (isAgendaitem) {
      const documentsAreReleased = this.args.agendaitemOrSubcase.get('agenda.createdFor.releasedDocuments');
      return !(isOverheid && !documentsAreReleased);
    }

    if (isSubcase) {
      const documentsAreReleased = this.args.agendaitemOrSubcase.get('requestedForMeeting.releasedDocuments');
      return !(isOverheid && !documentsAreReleased);
    }

    return true;
  }

  @action
  async enableDocumentEdit() {
    await this.args.agendaitemOrSubcase.preEditOrSaveCheck();
    this.isEnabledDocumentEdit = true;
  }

  @action
  disableDocumentEdit() {
    this.isEnabledDocumentEdit = false;
  }

  @action
  async openDocumentUploadModal() {
    await this.args.agendaitemOrSubcase.preEditOrSaveCheck();
    this.isOpenDocumentUploadModal = true;
  }

  @task
  *uploadDocument(file) {
    const now = moment().utc().toDate();
    const documentContainer = this.store.createRecord('document', {
      created: now
    });
    const document = this.store.createRecord('document-version', {
      created: now,
      modified: now,
      file: file,
      accessLevel: this.defaultAccessLevel,
      confidential: false,
      name: file.filenameWithoutExtension,
      documentContainer: documentContainer
    });
    this.newDocuments = A([document, ...this.newDocuments]);
  }

  @task
  *saveDocuments() {
    const savePromises = this.newDocuments.map(async (document) => {
      try {
        this.saveDocument.perform(document);
      } catch (error) {
        this.deleteDocument.perform(document);
        throw error;
      }
    });
    yield all(savePromises);
    yield this.updateRelatedAgendaitemsAndSubcase.perform(this.newDocuments);
    this.isOpenDocumentUploadModal = false;
    this.newDocuments = A();
  }

  /**
   * Save a new document container and the document it wraps
  */
  @task
  *saveDocument(document) {
    const documentContainer = yield document.documentContainer;
    yield documentContainer.save();
    yield document.save();
  }

  /**
   * Add new document to an existing document container
  */
  @task
  *addDocument(document) {
    yield document.save();
    yield this.updateRelatedAgendaitemsAndSubcase.perform([document]);
  }

  @task
  *updateRelatedAgendaitemsAndSubcase(documents) {
    if (this.itemType == 'agendaitem') {
      // Link documents to subcase related to the agendaitem
      const agendaActivity = yield this.args.agendaitemOrSubcase.agendaActivity;
      const subcase = yield agendaActivity.subcase;
      const currentSubcaseDocuments = yield subcase.hasMany('documentVersions').reload();
      currentSubcaseDocuments.pushObjects(documents);
      yield subcase.save();

      // Link document to agendaitem
      setNotYetFormallyOk(this.args.agendaitemOrSubcase);
      yield this.args.agendaitemOrSubcase.save();
      for (let document of documents) {
        yield addDocumentToAgendaitem(this.args.agendaitemOrSubcase, document);
      }
    } else if (this.itemType == 'subcase') {
      // Link document to all agendaitems that are related to the subcase via an agendaActivity
      // and related to an agenda in the design status
      const agendaitems = yield this.store.query('agendaitem', {
        'filter[agenda-activity][subcase][:id:]': this.args.agendaitemOrSubcase.get('id'),
        'filter[agenda][status][:id:]': config.agendaStatusDesignAgenda.id
      });
      const agendaitemUpdates = agendaitems.map(async (agendaitem) => {
        for (let document of documents) {
          await addDocumentToAgendaitem(agendaitem, document);
        }
        await agendaitem.hasMany('documentVersions').reload();
        setNotYetFormallyOk(agendaitem);
        await destroyApprovalsOfAgendaitem(agendaitem);
        await agendaitem.save();
      });
      yield all(agendaitemUpdates);

      // Link document to subcase
      const currentSubcaseDocuments = yield this.args.agendaitemOrSubcase.hasMany('documentVersions').reload();
      currentSubcaseDocuments.pushObjects(documents);
      yield this.args.agendaitemOrSubcase.save();
    }

    this.documents = yield this.args.agendaitemOrSubcase.hasMany('documentVersions').reload();
  }

  @task
  *cancelUploadDocuments() {
    const deletePromises = this.newDocuments.map(document => this.deleteDocument.perform(document));
    yield all(deletePromises);
    this.newDocuments = A();
    this.isOpenDocumentUploadModal = false;
  }

  @task
  *deleteDocument(document) {
    const file = yield document.file;
    yield file.destroyRecord();
    this.newDocuments.removeObject(document);
    const documentContainer = yield document.documentContainer;
    yield documentContainer.destroyRecord();
    yield document.destroyRecord();
  }

  @action
  openLinkedDocumentModal() {
    this.isOpenLinkedDocumentModal = true;
  }
}
