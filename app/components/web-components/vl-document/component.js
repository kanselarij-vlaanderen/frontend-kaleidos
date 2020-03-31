import Component from '@ember/component';
import UploadDocumentMixin from 'fe-redpencil/mixins/upload-document-mixin';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend(isAuthenticatedMixin, UploadDocumentMixin, {
  intl: service(),
  toaster: service(),
  fileService: service(),

  async didInsertElement() {
    this._super(...arguments);
    await this.resetPreferredAccessLevel();
  },

  classNames: ['vlc-document-card-item'],
  classNameBindings: ['aboutToDelete'],
  documentVersion: null,
  isEditingAccessLevel: false,

  aboutToDelete: computed('documentVersion.aboutToDelete', function () {
    if (this.documentVersion) {
      if (this.documentVersion.get('aboutToDelete')) {
        return 'vlc-document--deleted-state';
      }
    }
  }),

  preferredAccessLevel: null,

  resetPreferredAccessLevel: async function () {
    this.set('preferredAccessLevel', await this.documentVersion.get('accessLevel'));
  },

  actions: {
    cancel() {
      this.set('documentVersionToDelete', null);
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
        this.fileService.reverseDelete(this.documentVersionToDelete.get('id'));
        this.toaster.toasts.removeObject(verificationToast);
      };
      this.toaster.displayToast.perform(verificationToast);
      this.deleteDocumentVersionWithUndo();
      this.set('isVerifyingDelete', false);
    },

    deleteDocumentVersion(document) {
      this.set('documentVersionToDelete', document);
      this.set('isVerifyingDelete', true);
    },

    async toggleConfidential(document) {
      document.toggleProperty('confidential');
      await document.save();
    },

    chooseAccessLevel(accessLevel) {
      this.set('preferredAccessLevel', accessLevel);
    },

    async saveChanges() {
      let preferredAccessLevel = this.get('preferredAccessLevel');
      this.toggleProperty('isEditingAccessLevel');
      let documentVersion = this.get('documentVersion');
      if (preferredAccessLevel) {
        await documentVersion.set('accessLevel', preferredAccessLevel);
        await documentVersion.save();
      }
      this.resetPreferredAccessLevel();
    },
  },

  async deleteDocumentVersionWithUndo() {
    const documentVersionToDelete = this.get('documentVersionToDelete');

    // TODO somehow this no longer works, document returns null or undefined 
    // const document = await documentVersionToDelete.get('documentContainer');
    // const documentVersions = await document.get('documents');

    // TODO fix the deletion of document-container when last version is deleted so it doesn't become an orphan
    // if(documentVersions.length > 1) {
      await this.fileService.get('deleteDocumentVersionWithUndo').perform(documentVersionToDelete);
    // }else {
    //   const documentToDelete = document;
    //   await this.fileService.get('deleteDocumentWithUndo').perform(documentToDelete).then(() => {
    //     if(!this.item.aboutToDelete && documentVersions) {
    //       this.item.hasMany('documentVersions').reload();
    //     }
    //   });
    // }
  },
});
