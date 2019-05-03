import Component from '@ember/component';
import UploadDocumentMixin from 'fe-redpencil/mixins/upload-document-mixin';

export default Component.extend(UploadDocumentMixin, {
	tagName: 'ul',
	classNames:['vlc-document-list']
});
