import Controller from '@ember/controller';
import FileSaverMixin from 'ember-cli-file-saver/mixins/file-saver';
import $ from 'jquery';

export default Controller.extend(FileSaverMixin,{
	isAddingSubcase:false,

	actions: {
		toggleIsAddingSubcase() {
			this.toggleProperty('isAddingSubcase');
		},

		close() {
			this.toggleProperty('isAddingSubcase');
			this.send('refresh');
		},

		async downloadFile(documentVersion) {
			let file = await documentVersion.get('file');
				$.ajax(`/files/${file.id}?download=${file.filename}`, {
					method: 'GET',
					dataType: 'arraybuffer', // or 'blob'
					processData: false
				})
				.then((content) => this.saveFileAs(documentVersion.nameToDisplay, content, this.get('contentType')));
		},
	}
});
