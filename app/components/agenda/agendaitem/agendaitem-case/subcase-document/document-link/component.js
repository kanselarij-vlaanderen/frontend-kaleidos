import Component from '@ember/component';
import { computed } from '@ember/object';
import moment from 'moment';
import UploadDocumentMixin from 'fe-redpencil/mixins/upload-document-mixin';
import MyDocumentVersions from 'fe-redpencil/mixins/my-document-versions';
import { inject as service } from '@ember/service';
import { destroyApprovalsOfAgendaitem, setNotYetFormallyOk } from 'fe-redpencil/utils/agenda-item-utils';

export default Component.extend(UploadDocumentMixin, MyDocumentVersions, {
  toaster: service(),
  fileService: service(),
  intl: service(),
  currentSession: service(),
  classNames: ['vl-u-spacer-extended-bottom-s'],
  classNameBindings: ['aboutToDelete'],
  isShowingVersions: false,
  isUploadingNewVersion: false,
  uploadedFile: null,
  isEditing: false,
  documentContainerToDelete: null,
  nameBuffer: '',

  aboutToDelete: computed('document.aboutToDelete', function () {
    if (this.document) {
      if (this.document.get('aboutToDelete')) {
        return 'vlc-document--deleted-state';
      }
    }
  }),

  openClass: computed('isShowingVersions', function () {
    if (this.get('isShowingVersions')) {
      return 'js-vl-accordion--open';
    }
  }),

  async deleteUploadedDocument() {
    const uploadedFile = this.get('uploadedFile');
    if (uploadedFile && uploadedFile.id) {
      const versionInCreation = await uploadedFile.get('documentVersion');
      const container = this.get('documentContainer');
      container.rollbackAttributes();
      if (versionInCreation) {
        await this.fileService.deleteDocumentVersion(versionInCreation);
      } else {
        await this.fileService.deleteFile(uploadedFile);
      }

      if (!this.isDestroyed) {
        this.set('uploadedFile', null);
      }
    }
  },

  actions: {
    showVersions() {
      this.toggleProperty('isShowingVersions');
    },

    async delete() {
      this.deleteUploadedDocument();
    },

    startEditingName() {
      if (!this.currentSession.isEditor) {
        return;
      }
      this.set('nameBuffer', this.get('lastDocumentVersion.name'));
      this.set('isEditing', true);
    },

    cancelEditingName() {
      this.document.rollbackAttributes();
      this.set('isEditing', false);
    },

    async saveNameChange(doc) {
      doc.set('modified', moment().toDate());
      doc.set('name', this.get('nameBuffer'));
      await doc.save();
      if (!this.isDestroyed) {
        /*
         * Due to over-eager computed properties, this components gets destroyed after a namechange,
         * which eliminates the need for changing this flag (Changing properties of destroyed components causes exceptions).
         * This should get fixed in the future though.
         */
        this.set('isEditing', false);
      }
    },

    add(file) {
      this.set('uploadedFile', file);
      this.send('uploadedFile', file);
    },

    async openUploadDialog() {
      const itemType = this.item.get('constructor.modelName');
      if (itemType === "agendaitem" || itemType === "subcase") {
        await this.item.preEditOrSaveCheck();
      }
      this.toggleProperty('isUploadingNewVersion');
    },

    async closeUploadDialog() {
      this.deleteUploadedDocument();
      this.toggleProperty('isUploadingNewVersion');
    },

    async cancelUploadVersion() {
      const uploadedFile = this.get('uploadedFile');
      if (uploadedFile) {
        const container = this.get('documentContainer');
        const document = await this.get('documentContainer.lastDocumentVersion');
        container.rollbackAttributes();
        document.rollbackAttributes();
        const versionInCreation = await uploadedFile.get('documentVersion');
        if (versionInCreation) {
          await this.fileService.deleteDocumentVersion(versionInCreation);
        } else {
          await this.fileService.deleteFile(uploadedFile);
        }
        this.set('uploadedFile', null);
      }
      this.set('isUploadingNewVersion', false);
    },

    async saveDocument() {
      // TODO this component/method is used for agendaitem, subcase, session (AND for decision/meetingRecord but we pass in document model)
      // TODO should we seperate this logic to make the addition of a version more generic ? 
      this.set('isLoading', true);
      const document = await this.get('documentContainer.lastDocumentVersion');
      await document.save();
      const item = await this.get('item');
      const subcase = await item.get('subcase');
      const agendaitemsOnDesignAgenda = await item.get('agendaitemsOnDesignAgendaToEdit');
      try {
        if (subcase) {
          await this.addDocumentToSubcase([document], subcase);
        } else if (agendaitemsOnDesignAgenda && agendaitemsOnDesignAgenda.length > 0) {
          await this.addDocumentToAgendaitems([document], agendaitemsOnDesignAgenda);
        }
        await this.addDocumentToAnyModel([document], item);
      } catch (error) {
        await this.deleteUploadedDocument();
        throw error;
      } finally {
        if (!this.isDestroyed) {
          this.set('uploadedFile', null);
          this.set('isLoading', false);
          this.set('isUploadingNewVersion', false);
        }
      }
    },

    cancel() {
      this.set('documentContainerToDelete', null);
      this.set('isVerifyingDelete', false);
    },

    verify() {
      const verificationToast = {
        type: 'revert-action',
        title: this.intl.t('warning-title'),
        message: this.intl.t('document-being-deleted'),
        options: { timeOut: 15000 }
      };
      verificationToast.options.onUndo = () => {
        this.fileService.reverseDelete(this.documentContainerToDelete.get('id'));
        this.toaster.toasts.removeObject(verificationToast);
      };
      this.toaster.displayToast.perform(verificationToast);
      this.deleteDocumentContainerWithUndo();
      this.set('isVerifyingDelete', false);
    },

    deleteDocument(document) {
      this.set('documentContainerToDelete', document);
      this.set('isVerifyingDelete', true);
    },

  },

  async deleteDocumentContainerWithUndo() {
    const { item } = this;
    const documents = item.get('documentVersions');
    const itemType = item.get('constructor.modelName');
    if (itemType === 'document') {
      await this.fileService.get('deleteDocumentWithUndo').perform(this.documentContainerToDelete);
    } else {
      await this.fileService.get('deleteDocumentWithUndo').perform(this.documentContainerToDelete).then(() => {
        if (!item.aboutToDelete && documents) {
          item.hasMany('documentVersions').reload();
        }
      });
    }
  },

  async addDocumentToAgendaitems(documents, agendaitems) {
    return Promise.all(
      agendaitems.map(async (agendaitem) => {
        await agendaitem.hasMany('documentVersions').reload();
        await this.attachDocumentsToModel(documents, agendaitem);
        setNotYetFormallyOk(agendaitem);
        await destroyApprovalsOfAgendaitem(agendaitem);
        return await agendaitem.save();
      })
    );
  },
  async addDocumentToSubcase(documents, subcase) {
    await subcase.hasMany('documentVersions').reload();
    await this.attachDocumentsToModel(documents, subcase);
    setNotYetFormallyOk(subcase);
    return await subcase.save();
  },

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
  },
});
