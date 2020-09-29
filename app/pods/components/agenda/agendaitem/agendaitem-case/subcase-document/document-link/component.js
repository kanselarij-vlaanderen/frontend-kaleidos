import Component from '@glimmer/component';
import { action } from '@ember/object';
import moment from 'moment';
import { inject as service } from '@ember/service';
import {
  destroyApprovalsOfAgendaitem, setNotYetFormallyOk
} from 'fe-redpencil/utils/agendaitem-utils';
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
    const documents = this.args.subcaseAgendaitemMeetingOrDocumentContainer.documentVersions;
    const itemType = this.args.subcaseAgendaitemMeetingOrDocumentContainer.constructor.modelName;
    if (itemType === 'document') {
      await this.fileService.get('deleteDocumentWithUndo').perform(this.documentContainerToDelete);
    } else {
      await this.fileService.get('deleteDocumentWithUndo').perform(this.documentContainerToDelete)
        .then(() => {
          if (!this.args.subcaseAgendaitemMeetingOrDocumentContainer.aboutToDelete && documents) {
            this.args.subcaseAgendaitemMeetingOrDocumentContainer.hasMany('documentVersions').reload();
          }
        });
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async attachDocumentsToModel(documents, model, propertyName = 'documentVersions') {
    const modelName = await model.get('constructor.modelName');
    // Don't do anything for these models
    if (['decision'].includes(modelName)) {
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

  async addDocumentToAnyModel(documents, subcaseAgendaitemMeetingOrDocumentContainer) {
    const itemType = subcaseAgendaitemMeetingOrDocumentContainer.get('constructor.modelName');
    if (itemType === 'agenda-item-treatment') {
      // item.set(report documents[0])
      // return;
    }
    if (itemType === 'document') {
      // The document is already saved in this case
      return;
    }
    await subcaseAgendaitemMeetingOrDocumentContainer.hasMany('documentVersions').reload();
    await this.attachDocumentsToModel(documents, subcaseAgendaitemMeetingOrDocumentContainer);
    if (itemType === 'subcase' || itemType === 'agendaitem') {
      setNotYetFormallyOk(subcaseAgendaitemMeetingOrDocumentContainer);
    }
    return await subcaseAgendaitemMeetingOrDocumentContainer.save();
  }

  get setupDocumentVersions() {
    return this.mySortedDocumentVersions();
  }

  mySortedDocumentVersions() {
    const itemVersionIds = {};
    if (!this.args.subcaseAgendaitemMeetingOrDocumentContainer || !this.args.document) {
      return false;
    }
    const versions = this.args.subcaseAgendaitemMeetingOrDocumentContainer.documentVersions;
    if (versions) {
      versions.map((myDocumentVersion) => {
        itemVersionIds[myDocumentVersion.get('id')] = true;
      });
    }
    const documentVersions = this.args.document.sortedDocuments;
    if (documentVersions) {
      this.mySortedDocuments = documentVersions.filter((documentVersion) => itemVersionIds[documentVersion.id]);
      if (this.mySortedDocuments) {
        this.lastDocumentVersion = this.mySortedDocuments.lastObject;
      }
    }
    return true;
  }

  async getReverseSortedDocumentVersions() {
    const reversed = [];
    if (this.mySortedDocuments) {
      this.mySortedDocuments.map((mySortedDocumentVersion) => {
        reversed.push(mySortedDocumentVersion);
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
    await this.args.document.reload();
    await this.args.document.hasMany('documents').reload();
    if (!this.defaultAccessLevel) {
      this.defaultAccessLevel = await this.store.findRecord('access-level', config.internRegeringAccessLevelId);
    }

    const previousVersion = this.args.document ? (await this.args.document.get('lastDocumentVersion')) : null;
    const newDocument = this.createNewDocument(uploadedFile, previousVersion, {
      accessLevel: this.defaultAccessLevel,
    });
    newDocument.set('created', creationDate);
    newDocument.set('modified', creationDate);
    const docs = await this.args.document.get('documents');
    docs.pushObject(newDocument);
    newDocument.set('documentContainer', this.args.document); // Explicitly set relation both ways
    const newName = new VRDocumentName(previousVersion.get('name')).withOtherVersionSuffix(docs.length);
    newDocument.set('name', newName);
    this.args.document.notifyPropertyChange('documents');// Why exactly? Ember should handle this?
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
    this.args.document.rollbackAttributes();
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
    const itemType = this.args.subcaseAgendaitemMeetingOrDocumentContainer.constructor.modelName;
    if (itemType === 'agendaitem' || itemType === 'subcase') {
      await this.args.subcaseAgendaitemMeetingOrDocumentContainer.preEditOrSaveCheck();
    }
    this.isUploadingNewVersion = true;
  }

  @action
  async cancelUploadVersion() {
    if (this.uploadedFile) {
      const document = await this.args.document.lastDocumentVersion;
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
    const document = await this.args.document.lastDocument;
    await document.save();
    const agendaActivity = await this.args.subcaseAgendaitemMeetingOrDocumentContainer.agendaActivity; // when item = agendaitem
    const agendaitemsOnDesignAgenda = await this.args.subcaseAgendaitemMeetingOrDocumentContainer.agendaitemsOnDesignAgendaToEdit; // when item = subcase
    try {
      if (agendaActivity) {
        const subcase = await agendaActivity.get('subcase');
        await this.addDocumentToSubcase([document], subcase);
      } else if (agendaitemsOnDesignAgenda && agendaitemsOnDesignAgenda.length > 0) {
        await this.addDocumentToAgendaitems([document], agendaitemsOnDesignAgenda);
      }
      await this.addDocumentToAnyModel([document], this.args.subcaseAgendaitemMeetingOrDocumentContainer);
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
