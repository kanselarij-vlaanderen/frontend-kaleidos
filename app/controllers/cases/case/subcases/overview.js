import Controller from '@ember/controller';
import FileSaverMixin from 'ember-cli-file-saver/mixins/file-saver';
import $ from 'jquery';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Controller.extend(FileSaverMixin, isAuthenticatedMixin, {
	isAddingSubcase:false,
	isShowingOptions: false,
	
	actions: {
		toggleIsAddingSubcase() {
			this.toggleProperty('isAddingSubcase');
		},
		close() {
			this.toggleProperty('isAddingSubcase');
			this.send('refresh');
		},

		async downloadFile(documentVersion) {
			const version = await documentVersion;
			const file = await version.get('file');
				$.ajax(`/files/${file.id}/download?name=${file.filename}`, {
					method: 'GET',
					dataType: 'arraybuffer', // or 'blob'
					processData: false
				})
				.then((content) => this.saveFileAs(documentVersion.nameToDisplay, content, this.get('contentType')));
		},
    showMultipleOptions() {
      this.toggleProperty('isShowingOptions');
    },
	}
});
