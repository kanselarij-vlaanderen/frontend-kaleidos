import Component from '@ember/component';
import UploadDocumentMixin from 'fe-redpencil/mixins/upload-document-mixin';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Component.extend(UploadDocumentMixin, isAuthenticatedMixin, {
	classNames: ['vl-u-spacer-extended-l vlc-scroll-wrapper__body']
});
