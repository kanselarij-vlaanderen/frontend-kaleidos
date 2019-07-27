import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import $ from 'jquery';

export default Component.extend({
	classNames: ["vl-uploaded-document"],
	showDeleteWarning: false,
	isLoading: false,
	globalError: service(),

	removalWarningText: computed('model.name', function () {
		return `Weet u zeker dat u bestand "${this.get('model.filename')}" wil verwijderen?`;
	}),

	actions: {
		download() {
			$.ajax(`/files/${this.model.id}/download?name=${this.model.filename}.${this.model.extension}`, {
				method: 'GET',
				dataType: 'blob', // or 'arraybuffer'
				processData: false
			})
				.then((content) => this.saveFileAs(this.model.name, content, this.model.get('contentType')));
		},
		
		promptDelete() {
			this.set('showDeleteWarning', true);
			this.get('model').deleteRecord();
		},
		
		cancelDelete() {
			this.get('model').rollbackAttributes();
			this.set('showDeleteWarning', false);
		},
		
		confirmDelete() {
			this.set('isLoading', true);
			this.get('model').save().then(() => {
				this.set('showDeleteWarning', false);
			}).catch((error) => {
				this.globalError.handleError(error);
			}).finally(() => {
				this.set('isLoading', false);
			});
		},

	}
});
