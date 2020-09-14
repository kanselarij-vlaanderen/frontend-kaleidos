import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import {
  destroyApprovalsOfAgendaitem, setNotYetFormallyOk
} from 'fe-redpencil/utils/agendaitem-utils';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { all } from 'ember-concurrency';
import { action } from '@ember/object';
import { A } from '@ember/array';
import moment from 'moment';
import VRDocumentName from 'fe-redpencil/utils/vr-document-name';
import config from 'fe-redpencil/utils/config';

export default class DocumentLink extends Component {
  @service store;
  @service currentSession;
  @service fileService;
  @service toaster;
  @service intl;

  @tracked isExpandedVersionHistory = false;
  @tracked isOpenUploadModal = false;
  @tracked isOpenVerifyDeleteModal = false;
  @tracked isEditingDocument = false;

  @tracked uploadedFile;
  @tracked newDocument;
  @tracked documentNameBuffer;
  @tracked defaultAccessLevel;
  @tracked sortedDocuments = [];

  // Component arguments
  // item [Subcase|Agendaitem|null]: item to which the versions are attached
  // documentContainer: container to display the relevant versions for

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

    if (this.args.item) {
      // Construct the intersection of the documents linked to the item (agendaitem/subcase)
      // and all documents of the documentContainer
      const allDocuments = yield this.args.item.documentVersions;
      const containerDocuments = yield this.args.documentContainer.sortedDocuments;
      const sortedDocuments = [];
      if (containerDocuments.length) {
        for (let document of containerDocuments) {
          if (allDocuments.find(doc => doc.id == document.id)) {
            sortedDocuments.push(document);
          }
        }
      }
      this.sortedDocuments = A(sortedDocuments);
    } else {
      // TODO remove yield once consuming component doesn't pass Proxy as @documentContainer
      const documentContainer = yield this.args.documentContainer;
      const containerDocuments = yield documentContainer.sortedDocuments;
      this.sortedDocuments = A(containerDocuments);
    }
  }

  get lastDocument() {
    return this.sortedDocuments.length && this.sortedDocuments.lastObject;
  }

  get reverseSortedDocuments() {
    return this.sortedDocuments.slice(0).reverse();
  }

  get itemType() {
    return this.args.item && this.args.item.constructor.modelName;
  }

  @action
  async openUploadModal() {
    if (this.itemType === 'agendaitem' || this.itemType === 'subcase') {
      await this.args.item.preEditOrSaveCheck();
    }
    this.isOpenUploadModal = true;
  }


  @task
  *uploadDocument(file) {
    // ensure we're working on the most recent state of the document container
    const documentContainer = yield this.args.documentContainer.reload();
    const versions = yield documentContainer.hasMany('documents').reload();

    const previousDocument = yield documentContainer.lastDocument;
    const previousAccessLevel = yield previousDocument.accessLevel;
    const now = moment().utc().toDate();
    this.uploadedFile = file;
    this.newDocument = this.store.createRecord('document-version', {
      created: now,
      modified: now,
      file: file,
      previousVersion: previousDocument,
      confidential: previousDocument.confidential,
      accessLevel: previousAccessLevel || this.defaultAccessLevel,
      documentContainer: documentContainer
    });
    versions.pushObject(this.newDocument);
    const documentName = new VRDocumentName(previousDocument.name).withOtherVersionSuffix(versions.length);
    this.newDocument.set('name', documentName);
  }

  @task
  *addDocument() {
    try {
      yield this.newDocument.save(); // links the document to the documentContainer

      if (this.itemType == 'agendaitem') {
        // Link document to subcase related to the agendaitem
        const agendaActivity = yield this.args.item.agendaActivity;
        const subcase = yield agendaActivity.subcase;
        const currentSubcaseDocuments = yield subcase.hasMany('documentVersions').reload();
        currentSubcaseDocuments.insertAt(0, this.newDocument);
        yield subcase.save();

        // Link document to agendaitem
        setNotYetFormallyOk(this.args.item);
        const currentAgendaitemDocuments = yield this.args.item.hasMany('documentVersions').reload();
        // Next line triggers a rerender of the wrapping component, hence needs to be executed as late as possible
        currentAgendaitemDocuments.insertAt(0, this.newDocument);
        // TODO remove previous version from agendaitem if needed
        yield this.args.item.save();
      } else if (this.itemType == 'subcase') {
        // Link document to all agendaitems that are related to the subcase via an agendaActivity
        // and related to an agenda in the design status
        const agendaitems = yield this.store.query('agendaitem', {
          'filter[agenda-activity][subcase][:id:]': this.args.item.get('id'),
          'filter[agenda][status][:id:]': config.agendaStatusDesignAgenda.id
        });
        const agendaitemUpdates = agendaitems.map(async (agendaitem) => {
          const currentAgendaitemDocuments = await agendaitem.hasMany('documentVersions').reload();
          currentAgendaitemDocuments.insertAt(0, this.newDocument);
          // TODO remove previous version from agendaitem if needed
          setNotYetFormallyOk(agendaitem);
          await destroyApprovalsOfAgendaitem(agendaitem);
          await agendaitem.save();
        });
        yield all(agendaitemUpdates);

        // Link document to subcase
        const currentSubcaseDocuments =  yield this.args.item.hasMany('documentVersions').reload();
        // Next line triggers a rerender of the wrapping component, hence needs to be executed as late as possible
        currentSubcaseDocuments.insertAt(0, this.newDocument);
        yield this.args.item.save();
      }
      this.loadData.perform();
      this.uploadedFile = null;
      this.newDocument = null;
      this.isOpenUploadModal = false;
    } catch (error) {
      yield this.deleteUploadedDocument.perform();
      this.isOpenUploadModal = false;
      throw error;
    }
  }

  @task
  *deleteUploadedDocument() {
    if (this.uploadedFile && this.uploadedFile.id) {
      if (this.newDocument) {
        yield this.fileService.deleteDocumentVersion(this.newDocument);
      } else {
        yield this.fileService.deleteFile(this.uploadedFile);
      }
      this.newDocument = null;
      this.uploadedFile = null;
    }
  }

  @task
  *cancelUploadDocument() {
    yield this.deleteUploadedDocument.perform();
    this.isOpenUploadModal = false;
  }

  @action
  enableEditDocumentName() {
    if (this.currentSession.isEditor) {
      this.documentNameBuffer = this.lastDocument.name;
      this.isEditingDocument = true;
    }
  }

  @action
  cancelEditDocumentName() {
    this.isEditingDocument = false;
    this.documentNameBuffer = null;
  }

  @task
  *saveDocumentName() {
    const now = moment().toDate();
    this.lastDocument.set('modified', now);
    this.lastDocument.set('name', this.documentNameBuffer);
    yield this.lastDocument.save();
    this.isEditingDocument = false;
    this.documentNameBuffer = null;
  }

  @action
  toggleVersionHistory() {
    this.isExpandedVersionHistory = !this.isExpandedVersionHistory;
  }

  @action
  deleteDocumentContainer() {
    this.isOpenVerifyDeleteModal = true;
  }

  @action
  cancelDeleteDocumentContainer() {
    this.isOpenVerifyDeleteModal = false;
  }

  @action
  verifyDeleteDocumentContainer() {
    const verificationToast = {
      type: 'revert-action',
      title: this.intl.t('warning-title'),
      message: this.intl.t('document-being-deleted'),
      options: {
        timeOut: 15000,
      },
    };
    verificationToast.options.onUndo = () => {
      this.fileService.reverseDelete(this.args.documentContainer.get('id'));
      this.toaster.toasts.removeObject(verificationToast);
    };
    this.toaster.displayToast.perform(verificationToast);
    this.deleteDocumentContainerWithUndo.perform();
    this.isOpenVerifyDeleteModal = false;
  }

  @task
  *deleteDocumentContainerWithUndo() {
    // TODO remove yield once consuming component doesn't pass Proxy as @documentContainer
    const documentContainer = yield this.args.documentContainer;
    yield this.fileService.deleteDocumentWithUndo.perform(documentContainer);
  }

}
