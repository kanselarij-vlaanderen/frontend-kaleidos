import Component from '@ember/component';

export default Component.extend({
	classNames:["vl-u-spacer"],
	isAddingDocument: false,

	actions: {
		toggleIsAddingNewDocument() {
			this.toggleProperty('isAddingNewDocument');
		},

		getUploadedFile(file) {
			if(!this.get('uploadedFiles')) {
				this.set('uploadedFiles', []);
			}
			this.get('uploadedFiles').pushObject(file);
		},

		async uploadNewDocument() {
			const uploadedFiles = this.get('uploadedFiles');
			Promise.all(uploadedFiles.map(uploadedFile => {
				if (uploadedFile.id) {
					return this.createNewDocumentWithDocumentVersion(this.get('item'), uploadedFile, uploadedFile.get('name'));
				}
			})).then(() => {
				this.get('item').hasMany('documentVersions').reload();
				this.toggleProperty('isAddingNewDocument');
			});
		}
	}
});
