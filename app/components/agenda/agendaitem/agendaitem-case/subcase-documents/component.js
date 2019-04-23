import Component from '@ember/component';
import { EditAgendaitemOrSubcase } from 'fe-redpencil/mixins/edit-agendaitem-or-subcase';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Component.extend(EditAgendaitemOrSubcase, isAuthenticatedMixin, {
	classNames: ['vl-u-spacer--large'],
	isAddingNewDocument: false,
	isEditing: false,

	async createNewDocumentWithDocumentVersion(item, file, documentTitle) {
		let document = await this.store.createRecord('document', {
			created: new Date(),
			title: documentTitle,
			type: file.get('documentType'),
			confidentiality: file.get('confidentiality')
		});
		if(this.get('isAgendaItem')) {
			document.save().then(async (createdDocument) => {
				const documentVersion = await this.store.createRecord('document-version', {
					document: createdDocument,
					agendaitem: item,
					created: new Date(),
					versionNumber: 1,
					file: file,
					chosenFileName: file.get('chosenFileName') 
				});
				await documentVersion.save();
			});
		} else {
			document.save().then(async (createdDocument) => {
				const documentVersion = await this.store.createRecord('document-version', {
					document: createdDocument,
					subcase: item,
					created: new Date(),
					versionNumber: 1,
					file: file,
					chosenFileName: file.get('chosenFileName') 
				});
				await documentVersion.save();
		});
		}
		
	},

	actions: {
		toggleIsAddingNewDocument() {
			this.toggleProperty('isAddingNewDocument');
		},

		toggleIsEditing() {
			this.toggleProperty('isEditing');
		},

		cancelEditing() {
			this.toggleProperty('isEditing');
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
