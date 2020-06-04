import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({
  intl: service(),
  toaster: service(),
  fileService: service(),
  currentSession: service(),

  async didInsertElement() {
    this._super(...arguments);
  },

  classNames: ['vlc-document-card-item'],
  classNameBindings: ['aboutToDelete'],
  documentVersion: null,

  aboutToDelete: computed('documentVersion.aboutToDelete', function () {
    if (this.documentVersion) {
      if (this.documentVersion.get('aboutToDelete')) {
        return 'vlc-document--deleted-state';
      }
    }
  }),

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

    async showDocumentVersionViewer(documentVersion) {
      window.open(`/document/${(await documentVersion).get('id')}`);
    },
  },

});
