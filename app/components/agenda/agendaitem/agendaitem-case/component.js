import Component from '@ember/component';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';
import FileSaverMixin from 'ember-cli-file-saver/mixins/file-saver';
import $ from 'jquery';

export default Component.extend(FileSaverMixin, {
  classNames: ["u-spacer-top-l"],
  store: inject('store'),
  sessionService: inject(),
  currentSession: alias('sessionService.currentSession'),
  editable: null,
  agendaitem: null,

  actions: {
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
