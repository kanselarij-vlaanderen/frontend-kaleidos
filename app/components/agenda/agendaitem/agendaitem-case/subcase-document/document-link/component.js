import Component from '@ember/component';
import FileSaverMixin from 'ember-cli-file-saver/mixins/file-saver';
import $ from 'jquery';

export default Component.extend(FileSaverMixin,{
	classNames:["vl-u-spacer"],
	isShowingVersions: false,

	actions: {
		showVersions() {
			this.toggleProperty('isShowingVersions');
		},
		async downloadFile(documentVersion) {
			let file = await documentVersion.get('file');
				$.ajax(`/files/${file.id}?download=${file.filename}`, {
					method: 'GET',
					dataType: 'arraybuffer', // or 'blob'
					processData: false
				})
				.then((content) => this.saveFileAs(documentVersion.nameToDisplay, content, this.get('contentType')));
		}
	}
});
