import Component from '@ember/component';
import { computed } from '@ember/object';
import FileSaverMixin from 'ember-cli-file-saver/mixins/file-saver';
import $ from 'jquery';

export default Component.extend(FileSaverMixin, {

	classNames: ["agenda-item-container"],
	tagName: "div",
	selectedAgendaItem: null,
	index:null,

	number: computed('index', function() {
		if(this.index >=0) {
			return (this.index + 1);
		} 
	}),

	actions: {
		selectAgendaItem(agendaitem) {
			this.set('selectedAgendaItem', agendaitem);
      this.set("addComment", false);
		},

		async downloadFile(documentVersion) {
			let file = await documentVersion.get('file');
				$.ajax(`/files/${file.id}?download=${file.filename}`, {
					method: 'GET',
					dataType: 'arraybuffer', // or 'blob'
					processData: false
				})
				.then((content) => this.saveFileAs(file.filename, content, this.get('contentType')));
		}
	}
});
