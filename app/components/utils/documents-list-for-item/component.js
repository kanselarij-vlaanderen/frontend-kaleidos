import Component from '@ember/component';
import $ from 'jquery';
import FileSaverMixin from 'ember-cli-file-saver/mixins/file-saver';

export default Component.extend(FileSaverMixin, {
	tagName: 'ul',
	classNames:['vlc-document-list'],

	actions: {
		async	downloadFile(documentVersion) {
			if (!documentVersion) {
				return;
			}
			const file = await documentVersion.get('file')
			$.ajax(`/files/${file.id}/download?name=${file.filename}`, {
				method: 'GET',
				dataType: 'arraybuffer',
				processData: false
			})
				.then((content) => this.saveFileAs(documentVersion.nameToDisplay, content, this.get('contentType')));
		},
	}
});
