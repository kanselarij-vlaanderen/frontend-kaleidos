import Component from '@ember/component';
import { inject } from '@ember/service';
import $ from 'jquery';
import { computed } from '@ember/object';

export default Component.extend({
	store: inject(),
	selectedPerson: null,

	name: computed('selectedPerson', function () {
		if (this.selectedPerson) {
			return this.selectedPerson.get('nameToDisplay');
		}
	}),

	actions: {
		personSelected(person) {
			this.set('selectedPerson', person);
		},

		closeModal() {
			this.closeModal();
		},

		async createSignature() {
			const newSignature = this.store.createRecord('signature', {
				name: this.get('name'),
				function: this.get('function'),
				isActive: false,
				person: await this.get('selectedPerson'),
				file: this.get('uploadedFile')
			});
			newSignature.save().then(() => {
				this.clearValues();
				this.closeModal();
			});
		},
		async getUploadedFile(file) {
			this.set('fileName', file.filename)
			this.set('uploadedFile', file);
		},

		removeFile() {
			$.ajax({
				method: "DELETE",
				url: '/files/' + this.get('uploadedFile.id')
			});
			this.set('uploadedFile', null);
		}
	},

	clearValues() {
		this.set('selectedPerson', null);
		this.set('name', null);
		this.set('function', null);
	}
});
