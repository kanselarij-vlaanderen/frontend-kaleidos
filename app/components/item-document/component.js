import Component from '@ember/component';
import MyDocumentVersions from 'fe-redpencil/mixins/my-document-versions';
import UploadDocumentMixin from 'fe-redpencil/mixins/upload-document-mixin';

export default Component.extend(UploadDocumentMixin, MyDocumentVersions, {
  isClickable: null
});
