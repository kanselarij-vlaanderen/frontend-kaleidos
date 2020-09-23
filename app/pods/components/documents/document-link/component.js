import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
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

    // TODO remove yield once consuming component doesn't pass Proxy as @documentContainer
    const documentContainer = yield this.args.documentContainer;
    const containerDocuments = yield documentContainer.sortedDocuments;
    if (this.args.lastDocument) {
      const idx = containerDocuments.indexOf(this.args.lastDocument);
      this.sortedDocuments = A(containerDocuments.slice(0, idx + 1));
    } else {
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
    return this.args.agendaitemOrSubcase && this.args.agendaitemOrSubcase.constructor.modelName;
  }

  @action
  async openUploadModal() {
    if (this.itemType === 'agendaitem' || this.itemType === 'subcase') {
      await this.args.agendaitemOrSubcase.preEditOrSaveCheck();
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
    const now = moment().utc()
      .toDate();
    this.newDocument = this.store.createRecord('document-version', {
      created: now,
      modified: now,
      file: file,
      previousVersion: previousDocument,
      confidential: previousDocument.confidential,
      accessLevel: previousAccessLevel || this.defaultAccessLevel,
      documentContainer: documentContainer,
    });
    versions.pushObject(this.newDocument);
    const documentName = new VRDocumentName(previousDocument.name).withOtherVersionSuffix(versions.length);
    this.newDocument.set('name', documentName);
  }

  @task
  *addDocument() {
    try {
      yield this.args.onAddDocument(this.newDocument);
      this.loadData.perform();
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
    if (this.newDocument) {
      yield this.fileService.deleteDocumentVersion(this.newDocument);
      this.newDocument = null;
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
