import Component from '@ember/component';
import { computed } from '@ember/object';
import moment from 'moment';
import UploadDocumentMixin from 'fe-redpencil/mixins/upload-document-mixin';
import MyDocumentVersions from 'fe-redpencil/mixins/my-document-versions';
import { inject as service } from '@ember/service';
import CONFIG from 'fe-redpencil/utils/config';

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
  documentToDelete: null,
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

  setNotYetFormallyOk(itemToSet) {
    if (itemToSet.get('formallyOk') != CONFIG.notYetFormallyOk) {
      itemToSet.set('formallyOk', CONFIG.notYetFormallyOk);
    }
  },

  async destroyApprovalsOfAgendaitem(agendaitem) {
    const approvals = await agendaitem.get('approvals');
    if (approvals) {
      await Promise.all(approvals.map(approval => approval.destroyRecord()));
    }
  },

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
        const doc = await this.get('documentContainer.lastDocumentVersion');
        container.rollbackAttributes();
        doc.rollbackAttributes();
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

    async saveDocuments() {
      this.set('isLoading', true);
      const documentVersion = await this.get('documentContainer.lastDocumentVersion');
      await documentVersion.save();
      const item = await this.get('item');
      await item.hasMany('documentVersions').reload();
      const itemType = item.get('constructor.modelName');
      const subcase = await item.get('subcase');
      const agendaitemsOnDesignAgenda = await item.get('agendaitemsOnDesignAgendaToEdit');
      try {
        if (itemType !== "decision" && subcase) {
          await subcase.hasMany('documentVersions').reload();
          await this.attachDocumentVersionsToModel([documentVersion], subcase).then(async item => {
            this.setNotYetFormallyOk(item);
            await item.save();
          });
        } else if (agendaitemsOnDesignAgenda && agendaitemsOnDesignAgenda.length > 0) {
          await this.addDocumentVersionsToAgendaitems([documentVersion], agendaitemsOnDesignAgenda);
        }
        await this.attachDocumentVersionsToModel([documentVersion], item);
        if (subcase || itemType === 'subcase') {
          this.setNotYetFormallyOk(item);
        }
        await item.save();
      } catch (error) {
        await this.deleteUploadedDocument();
        throw error;
      } finally {
        if (!this.isDestroyed) {
          this.set('isLoading', false);
          this.set('isUploadingNewVersion', false);
        }
      }
    },

    cancel() {
      this.set('documentToDelete', null);
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
        this.fileService.reverseDelete(this.documentToDelete.get('id'));
        this.toaster.toasts.removeObject(verificationToast);
      };
      this.toaster.displayToast.perform(verificationToast);
      this.deleteDocumentWithUndo();
      this.set('isVerifyingDelete', false);
    },

    deleteDocument(document) {
      this.set('documentToDelete', document);
      this.set('isVerifyingDelete', true);
    },

    async toggleConfidential() {

    },
  },

  async deleteDocumentWithUndo() {
    const { item } = this;
    const documentVersions = item.get('documentVersions');
    await this.fileService.get('deleteDocumentWithUndo').perform(this.documentToDelete).then(() => {
      if (!item.aboutToDelete && documentVersions) {
        item.hasMany('documentVersions').reload();
      }
    });
  },

  async addDocumentVersionsToAgendaitems(documentVersions, agendaitems) {
    return Promise.all(
      agendaitems.map(async (agendaitem) => {
        await agendaitem.hasMany('documentVersions').reload();
        await this.attachDocumentVersionsToModel(documentVersions, agendaitem);
        this.setNotYetFormallyOk(agendaitem);
        await this.destroyApprovalsOfAgendaitem(agendaitem);
        return await agendaitem.save();
      })
    );
  },
});
