import Component from '@ember/component';
import { computed } from '@ember/object';
import UploadDocumentMixin from 'fe-redpencil/mixins/upload-document-mixin';
import { inject } from '@ember/service';
import MyDocumentVersions from 'fe-redpencil/mixins/my-document-versions';

export default Component.extend(UploadDocumentMixin, MyDocumentVersions, {
  fileService: inject(),
  currentSession: inject(),
  classNames: ['vl-u-spacer-extended-bottom-s'],
  classNameBindings: ['aboutToDelete'],
  isShowingVersions: false,
  isUploadingNewVersion: false,
  uploadedFile: null,
  isEditing: false,
  documentToDelete: null,

  openClass: computed('isShowingVersions', function () {
    if (this.get('isShowingVersions')) {
      return 'js-vl-accordion--open';
    }
  }),

  myDocumentVersions: computed.alias('item.linkedDocumentVersions'),

  actions: {
    showVersions() {
      this.toggleProperty('isShowingVersions');
    },

    cancel() {
      this.set('documentToDelete', null);
      this.set('isVerifyingUnlink', false);
    },

    async verify() {
      const documentVersions = await this.get('documentToDelete.documentVersions');
      await this.unlinkDocumentVersions(documentVersions, this.get('item'));
      if (!this.isDestroyed) {
        this.set('isVerifyingUnlink', false);
      }
    },

    unlinkDocument(document) {
      this.set('documentToDelete', document);
      this.set('isVerifyingUnlink', true);
    }
  },
});
