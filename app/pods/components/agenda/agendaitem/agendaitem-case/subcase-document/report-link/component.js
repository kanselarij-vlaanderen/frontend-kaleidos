import Component from '@glimmer/component';
import { action } from '@ember/object';
import moment from 'moment';
import { inject as service } from '@ember/service';
import config from 'fe-redpencil/utils/config';
import { A } from '@ember/array';
import VRDocumentName from 'fe-redpencil/utils/vr-document-name';
import { tracked } from '@glimmer/tracking';

export default class ReportLink extends Component {
  @service toaster;
  @service fileService;
  @service intl;
  @service currentSession;
  @service store;

  @tracked isShowingVersions = false;
  @tracked reverseSortedDocumentVersions = A([]);
  @tracked isUploadingNewVersion = false;
  @tracked isEditing = false;
  @tracked defaultAccessLevel = null;
  @tracked documentInCreation = null;
  @tracked uploadedFile = null;
  @tracked nameBuffer = '';
  @tracked isVerifyingDelete = false;
  @tracked lastDocument = null;
  @tracked mySortedDocuments;
  @tracked lastDocumentVersion = null;
  @tracked documentTypes = null;

  classNameBindings = ['aboutToDelete'];
  documentContainerToDelete = null;

  constructor() {
    super(...arguments);
    this.store.query('document-type', {
      sort: 'priority', 'page[size]': 50,
    }).then((types) => {
      this.documentTypes = types;
    });
  }

  async deleteUploadedDocument() {
    if (this.uploadedFile && this.uploadedFile.id) {
      const versionInCreation = await this.uploadedFile.documentVersion;
      this.documentsInCreation = null;
      if (versionInCreation) {
        await this.fileService.deleteDocumentVersion(versionInCreation);
      } else {
        await this.fileService.deleteFile(this.uploadedFile);
      }

      if (!this.isDestroyed) {
        this.uploadedFile = null;
      }
      await this.args.treatment.belongsTo('report').reload();
    }
  }

  createNewDocument(uploadedFile, previousDocument, defaults) {
    const propsFromPrevious = [
      'accessLevel',
      'confidential'
    ];
    const newDocument = this.store.createRecord('document-version', {});
    propsFromPrevious.forEach(async(key) => {
      newDocument.set(key, previousDocument
        ? await previousDocument.getWithDefault(key, defaults[key])
        : defaults[key]);
    });
    newDocument.set('file', uploadedFile);
    newDocument.set('previousVersion', previousDocument);
    newDocument.set('name', uploadedFile.get('filenameWithoutExtension'));
    return newDocument;
  }

  async deleteDocumentContainerWithUndo() {
    await this.fileService.get('deleteDocumentWithUndo').perform(this.documentContainerToDelete);
  }

  // eslint-disable-next-line class-methods-use-this
  async attachDocumentToTreatment(document, treatment) {
    const report = await treatment.get('report');
    if (report) {
      treatment.set('report', document);
      await treatment.save();
    }
    return treatment;
  }

  get openClass() {
    if (this.isShowingVersions) {
      return 'js-vl-accordion--open';
    }
    return null;
  }

  @action
  async uploadFile(uploadedFile) {
    const creationDate = moment().utc()
      .toDate();
    if (await this.args.documentContainer) {
      await this.args.documentContainer.reload();
    }
    await this.args.documentContainer.hasMany('documents').reload();
    if (!this.defaultAccessLevel) {
      this.defaultAccessLevel = await this.store.findRecord('access-level', config.internRegeringAccessLevelId);
    }

    const previousVersion = this.args.documentContainer ? (await this.args.documentContainer.get('lastDocumentVersion')) : null;
    const newDocument = this.createNewDocument(uploadedFile, previousVersion, {
      accessLevel: this.defaultAccessLevel,
    });
    newDocument.set('created', creationDate);
    newDocument.set('modified', creationDate);
    const docs = await this.args.documentContainer.get('documents');
    docs.pushObject(newDocument);
    newDocument.set('documentContainer', this.args.documentContainer); // Explicitly set relation both ways
    const newName = new VRDocumentName(previousVersion.get('name')).withOtherVersionSuffix(docs.length);
    newDocument.set('name', newName);
    this.args.documentContainer.notifyPropertyChange('documents');// Why exactly? Ember should handle this?
    this.documentInCreation = await newDocument;
  }

  @action
  showVersions() {
    this.isShowingVersions = !this.isShowingVersions;
  }

  @action
  async delete() {
    await this.deleteUploadedDocument();
  }

  @action
  startEditingName() {
    if (!this.currentSession.isEditor) {
      return;
    }
    this.nameBuffer = this.args.treatment.report.get('name');
    this.isEditing = true;
  }

  @action
  cancelEditingName() {
    this.args.treatment.report.rollbackAttributes();
    this.isEditing = false;
  }

  @action
  async saveNameChange() {
    const report = await this.args.treatment.get('report');
    report.set('modified', moment().toDate());
    report.set('name', this.nameBuffer);
    await report.save();
    if (!this.isDestroyed) {
      this.isEditing = false;
    }
  }

  @action
  async add(file) {
    this.uploadedFile = file;
    await this.uploadFile(file);
  }

  @action
  async openUploadDialog() {
    this.isUploadingNewVersion = true;
  }

  @action
  async cancelUploadVersion() {
    if (this.uploadedFile) {
      const document = await this.args.documentContainer.lastDocumentVersion;
      document.rollbackAttributes();
      const versionInCreation = await this.uploadedFile.get('documentVersion');
      if (versionInCreation) {
        await this.fileService.deleteDocumentVersion(versionInCreation);
      } else {
        await this.fileService.deleteFile(this.uploadedFile);
      }
      this.uploadedFile = null;
    }
    this.isUploadingNewVersion = false;
  }

  @action
  async saveDocument() {
    this.isLoading = true;
    const document = await this.args.documentContainer.lastDocument;
    await document.save();
    try {
      await this.attachDocumentToTreatment(document, this.args.treatment);
    } catch (error) {
      await this.deleteUploadedDocument();
      throw error;
    } finally {
      if (!this.isDestroyed) {
        this.uploadedFile = null;
        this.isLoading = false;
        this.isUploadingNewVersion = false;
      }
    }
  }

  @action
  cancel() {
    this.documentContainerToDelete = null;
    this.isVerifyingDelete = false;
  }

  @action
  verify() {
    const verificationToast = {
      type: 'revert-action',
      title: this.intl.t('warning-title'),
      message: this.intl.t('document-being-deleted'),
      options: {
        timeOut: 15000,
      },
    };
    verificationToast.options.onUndo = () => {
      this.fileService.reverseDelete(this.documentContainerToDelete.get('id'));
      this.toaster.toasts.removeObject(verificationToast);
    };
    this.toaster.displayToast.perform(verificationToast);
    this.deleteDocumentContainerWithUndo();
    this.isVerifyingDelete = false;
  }

  @action
  deleteDocument(document) {
    this.documentContainerToDelete = document;
    this.isVerifyingDelete = true;
  }
}
