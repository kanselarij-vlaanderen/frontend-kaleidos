import Component from '@ember/component';
import { inject } from '@ember/service';
import $ from 'jquery';
import { computed } from '@ember/object';

export default Component.extend({
	store: inject(),
	signatureToEdit: null,

	uploadedFile: computed('signatureToEdit.file', function () {
		return this.signatureToEdit.get('file');
	}),

	downloadUrl: computed('signatureToEdit.file', function () {
		return `/files/${this.signatureToEdit.get('file.id')}/download`;
	}),

	actions: {
		closeModal() {
			this.signatureToEdit.rollbackAttributes();
			this.closeModal();
		},

		saveChanges() {
			if (this.get('uploadedFile')) {
				this.signatureToEdit.set('file', this.get('uploadedFile'))
			}
			this.signatureToEdit.save().then(() => {
				this.closeModal();
			});

		},

		async getUploadedFile(file) {
			this.set('fileName', file.filename)
			this.set('uploadedFile', file);
		},

		personSelected(person) {
			this.set('selectedPerson', person);
		},

		removeFile() {
			$.ajax({
				method: "DELETE",
				url: '/files/' + this.get('uploadedFile.id')
			});
			this.set('uploadedFile', null);
		}
	}

});
