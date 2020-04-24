import Component from '@ember/component';
import UploadDocumentMixin from 'fe-redpencil/mixins/upload-document-mixin';

export default Component.extend(UploadDocumentMixin, {
  classNames: ['vl-u-spacer-extended-l'],
  actions: {
    toggleIsShowingDocuments(subcase) {
      subcase.toggleProperty('isShowingDocuments');
    }
  }
});
