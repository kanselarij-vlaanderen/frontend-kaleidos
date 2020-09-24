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
  @tracked linkedDocuments = A([]);
  @tracked newDocuments = A([]);
  @tracked newLinkedDocuments = A([]);

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @task
  *loadData() {
    this.defaultAccessLevel = this.store.peekRecord('access-level', config.internRegeringAccessLevelId);
    if (!this.defaultAccessLevel) {
      const accessLevels = yield this.store.query('access-level', {
        page: {
          size: 1,
        },
        'filter[:id:]': config.internRegeringAccessLevelId,
      });
      this.defaultAccessLevel = accessLevels.firstObject;
    }

    // TODO change to store.query to have control over the page size
    this.documents = yield this.args.agendaitemOrSubcase.documentVersions;
    this.linkedDocuments = yield this.args.agendaitemOrSubcase.linkedDocumentVersions;
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

  @action
  uploadDocument(file) {
    const now = moment().utc()
      .toDate();
    const documentContainer = this.store.createRecord('document', {
      created: now,
    });
    const document = this.store.createRecord('document-version', {
      created: now,
      modified: now,
      file: file,
      accessLevel: this.defaultAccessLevel,
      confidential: false,
      name: file.filenameWithoutExtension,
      documentContainer: documentContainer,
    });
    this.newDocuments = A([document, ...this.newDocuments]);
  }

  @task
  *saveDocuments() {
    const savePromises = this.newDocuments.map(async(document) => {
      try {
        await this.saveDocument.perform(document);
      } catch (error) {
        await this.deleteDocument.perform(document);
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
    if (this.itemType === 'agendaitem') {
      // Link documents to subcase related to the agendaitem
      const agendaActivity = yield this.args.agendaitemOrSubcase.agendaActivity;
      const subcase = yield agendaActivity.subcase;
      const currentSubcaseDocuments = yield subcase.hasMany('documentVersions').reload();
      const subcaseDocuments = currentSubcaseDocuments.pushObjects(documents);
      subcase.set('documentVersions', subcaseDocuments);
      yield subcase.save();

      // Link document to agendaitem
      setNotYetFormallyOk(this.args.agendaitemOrSubcase);
      yield this.args.agendaitemOrSubcase.save();
      for (const document of documents) {
        yield addDocumentToAgendaitem(this.args.agendaitemOrSubcase, document);
      }

      this.documents = yield this.args.agendaitemOrSubcase.hasMany('documentVersions').reload();
    } else if (this.itemType === 'subcase') {
      // Link document to all agendaitems that are related to the subcase via an agendaActivity
      // and related to an agenda in the design status
      const agendaitems = yield this.store.query('agendaitem', {
        'filter[agenda-activity][subcase][:id:]': this.args.agendaitemOrSubcase.get('id'),
        'filter[agenda][status][:id:]': config.agendaStatusDesignAgenda.id,
      });
      const agendaitemUpdates = agendaitems.map(async(agendaitem) => {
        for (const document of documents) {
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
      const subcaseDocuments = currentSubcaseDocuments.pushObjects(documents);
      this.args.agendaitemOrSubcase.set('documentVersions', subcaseDocuments);
      yield this.args.agendaitemOrSubcase.save();

      this.documents = subcaseDocuments;
    }
  }

  @task
  *cancelUploadDocuments() {
    const deletePromises = this.newDocuments.map((document) => this.deleteDocument.perform(document));
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

  @action
  cancelLinkDocuments() {
    this.newLinkedDocuments = A([]);
    this.isOpenLinkedDocumentModal = false;
  }

  @action
  linkDocument(document) {
    this.newLinkedDocuments.pushObject(document);
  }

  @action
  unlinkDocument(document) {
    this.newLinkedDocuments.removeObject(document);
  }

  @task
  *saveLinkedDocuments() {
    let allDocumentsToLink = [];
    for (const linkedDocument of this.newLinkedDocuments) {
      const documents = yield this.store.query('document-version', {
        'filter[document-container][documents][:id:]': linkedDocument.get('id'),
        page: {
          size: 300,
        },
      });
      allDocumentsToLink = [...allDocumentsToLink, ...documents.toArray()];
    }

    if (allDocumentsToLink.length) {
      if (this.itemType === 'agendaitem') {
        // Link documents to subcase related to the agendaitem
        const agendaActivity = yield this.args.agendaitemOrSubcase.agendaActivity;
        const subcase = yield agendaActivity.subcase;
        const currentSubcaseDocuments = yield subcase.hasMany('linkedDocumentVersions').reload();
        const subcaseDocuments = currentSubcaseDocuments.pushObjects(allDocumentsToLink);
        subcase.set('linkedDocumentVersions', subcaseDocuments);
        yield subcase.save();
      } else if (this.itemType === 'subcase') {
        // Link document to all agendaitems that are related to the subcase via an agendaActivity
        // and related to an agenda in the design status
        const agendaitems = yield this.store.query('agendaitem', {
          'filter[agenda-activity][subcase][:id:]': this.args.agendaitemOrSubcase.get('id'),
          'filter[agenda][status][:id:]': config.agendaStatusDesignAgenda.id,
        });
        const agendaitemUpdates = agendaitems.map(async(agendaitem) => {
          const currentAgendaitemDocuments = await agendaitem.hasMany('linkedDocumentVersions').reload();
          const agendaitemDocuments = currentAgendaitemDocuments.pushObjects(allDocumentsToLink);
          agendaitem.set('linkedDocumentVersions', agendaitemDocuments);
          await agendaitem.save();
        });
        yield all(agendaitemUpdates);
      }

      // Link document to subcase/agendaitem
      const currentDocuments = yield this.args.agendaitemOrSubcase.hasMany('linkedDocumentVersions').reload();
      const documents = currentDocuments.pushObjects(allDocumentsToLink);
      this.args.agendaitemOrSubcase.set('linkedDocumentVersions', documents);
      yield this.args.agendaitemOrSubcase.save();
      this.linkedDocuments = currentDocuments;
    }

    this.newLinkedDocuments = A([]);
    this.isOpenLinkedDocumentModal = false;
  }

  @task
  *unlinkDocumentContainer(documentContainer) {
    const documentsToRemove = (yield documentContainer.documents).toArray();

    if (this.itemType === 'agendaitem') {
      // Unlink documents from subcase related to the agendaitem
      const agendaActivity = yield this.args.agendaitemOrSubcase.agendaActivity;
      const subcase = yield agendaActivity.subcase;
      const currentSubcaseDocuments = yield subcase.hasMany('linkedDocumentVersions').reload();
      const subcaseDocuments = currentSubcaseDocuments.removeObjects(documentsToRemove);
      subcase.set('linkedDocumentVersions', subcaseDocuments);
      yield subcase.save();
    } else if (this.itemType === 'subcase') {
      // Unlink document from all agendaitems that are related to the subcase via an agendaActivity
      // and related to an agenda in the design status
      const agendaitems = yield this.store.query('agendaitem', {
        'filter[agenda-activity][subcase][:id:]': this.args.agendaitemOrSubcase.get('id'),
        'filter[agenda][status][:id:]': config.agendaStatusDesignAgenda.id,
      });
      const agendaitemUpdates = agendaitems.map(async(agendaitem) => {
        const currentAgendaitemDocuments = await agendaitem.hasMany('linkedDocumentVersions').reload();
        const agendaitemDocuments = currentAgendaitemDocuments.removeObjects(documentsToRemove);
        agendaitem.set('linkedDocumentVersions', agendaitemDocuments);
        await agendaitem.save();
      });
      yield all(agendaitemUpdates);
    }

    const currentDocuments = yield this.args.agendaitemOrSubcase.hasMany('linkedDocumentVersions').reload();
    const documents = currentDocuments.removeObjects(documentsToRemove);
    this.args.agendaitemOrSubcase.set('linkedDocumentVersions', documents);
    yield this.args.agendaitemOrSubcase.save();
    this.linkedDocuments = documents;
  }
}
