import Component from '@glimmer/component';
import { action } from '@ember/object';
import moment from 'moment';
import { inject as service } from '@ember/service';
import {
  destroyApprovalsOfAgendaitem, setNotYetFormallyOk
} from 'fe-redpencil/utils/agenda-item-utils';
import config from 'fe-redpencil/utils/config';
import { A } from '@ember/array';
import VRDocumentName from 'fe-redpencil/utils/vr-document-name';
import { tracked } from '@glimmer/tracking';

export default class DocumentLink extends Component {
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
  @tracked lastDocumentVersion = null

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
    const documents = this.args.item.documentVersions;
    const itemType = this.args.item.constructor.modelName;
    if (itemType === 'document') {
      await this.fileService.get('deleteDocumentWithUndo').perform(this.documentContainerToDelete);
    } else {
      await this.fileService.get('deleteDocumentWithUndo').perform(this.documentContainerToDelete)
        .then(() => {
          if (!this.args.item.aboutToDelete && documents) {
            this.args.item.hasMany('documentVersions').reload();
          }
        });
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async attachDocumentsToModel(documents, model, propertyName = 'documentVersions') {
    const modelName = await model.get('constructor.modelName');
    // Don't do anything for these models
    if (['meeting-record', 'decision'].includes(modelName)) {
      return model;
    }

    const modelDocumentVersions = await model.get(propertyName);
    if (modelDocumentVersions) {
      model.set(
        propertyName,
        A(Array.prototype.concat(modelDocumentVersions.toArray(), documents.toArray()))
      );
    } else {
      model.set(propertyName, documents);
    }
    return model;
  }

  async addDocumentToAgendaitems(documents, agendaitems) {
    return Promise.all(
      agendaitems.map(async(agendaitem) => {
        await agendaitem.hasMany('documentVersions').reload();
        await this.attachDocumentsToModel(documents, agendaitem);
        setNotYetFormallyOk(agendaitem);
        await destroyApprovalsOfAgendaitem(agendaitem);
        return await agendaitem.save();
      })
    );
  }

  async addDocumentToSubcase(documents, subcase) {
    await subcase.hasMany('documentVersions').reload();
    await this.attachDocumentsToModel(documents, subcase);
    return await subcase.save();
  }

  async addDocumentToAnyModel(documents, item) {
    const itemType = item.get('constructor.modelName');
    if (itemType === 'document') {
      // The document is already saved in this case
      return;
    }
    await item.hasMany('documentVersions').reload();
    await this.attachDocumentsToModel(documents, item);
    if (itemType === 'subcase' || itemType === 'agendaitem') {
      setNotYetFormallyOk(item);
    }
    return await item.save();
  }

  get setupDocumentVersions() {
    this.mySortedDocumentVersions();
    return true;
  }

  mySortedDocumentVersions() {
    const itemVersionIds = {};
    const versions = this.args.item.documentVersions;
    if (versions) {
      versions.map((item) => {
        itemVersionIds[item.get('id')] = true;
      });
    }
    const documentVersions = this.args.documentContainer.sortedDocumentVersions;
    if (documentVersions) {
      this.mySortedDocuments = documentVersions.filter((item) => itemVersionIds[item.id]);
      if (this.mySortedDocuments) {
        this.lastDocumentVersion = this.mySortedDocuments.lastObject;
      }
    }
  }

  async getReverseSortedDocumentVersions() {
    const reversed = [];
    if (this.mySortedDocuments) {
      this.mySortedDocuments.map((item) => {
        reversed.push(item);
      });
      reversed.reverse();
      this.reverseSortedDocumentVersions = reversed;
    }
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
    await this.args.documentContainer.reload();
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
    if (this.isShowingVersions) {
      this.getReverseSortedDocumentVersions();
    }
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
    this.nameBuffer = this.lastDocumentVersion.name;
    this.isEditing = true;
  }

  @action
  cancelEditingName() {
    this.args.documentContainer.rollbackAttributes();
    this.isEditing = false;
  }

  @action
  async saveNameChange(doc) {
    doc.set('modified', moment().toDate());
    doc.set('name', this.nameBuffer);
    await doc.save();
    if (!this.isDestroyed) {
      /*
       * Due to over-eager computed properties, this components gets destroyed after a namechange,
       * which eliminates the need for changing this flag (Changing properties of destroyed components causes exceptions).
       * This should get fixed in the future though.
       */
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
    const itemType = this.args.item.constructor.modelName;
    if (itemType === 'agendaitem' || itemType === 'subcase') {
      await this.args.item.preEditOrSaveCheck();
    }
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
    // TODO this component/method is used for agendaitem, subcase, session (AND for decision/meetingRecord but we pass in document model)
    // TODO should we seperate this logic to make the addition of a version more generic ?
    this.isLoading = true;
    const document = await this.args.documentContainer.lastDocument;
    await document.save();
    const agendaActivity = await this.args.item.agendaActivity; // when item = agendaitem
    const agendaitemsOnDesignAgenda = await this.args.item.agendaitemsOnDesignAgendaToEdit; // when item = subcase
    try {
      if (agendaActivity) {
        const subcase = await agendaActivity.get('subcase');
        await this.addDocumentToSubcase([document], subcase);
      } else if (agendaitemsOnDesignAgenda && agendaitemsOnDesignAgenda.length > 0) {
        await this.addDocumentToAgendaitems([document], agendaitemsOnDesignAgenda);
      }
      await this.addDocumentToAnyModel([document], this.args.item);
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
