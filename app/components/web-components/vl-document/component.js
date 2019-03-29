import Component from '@ember/component';
import $ from 'jquery';
import FileSaverMixin from 'ember-cli-file-saver/mixins/file-saver';

export default Component.extend(FileSaverMixin, {
	file: null,

	actions: {
		async downloadFile() {
			const file = this.get('file');
      $.ajax(`/files/${file.id}/download?name=${file.filename}`, {
				method: 'GET',
				dataType: 'arraybuffer', // or 'blob'
				processData: false
			})
        .then((content) => this.saveFileAs(file.name, content, this.get('contentType')));
		}
	}
});
