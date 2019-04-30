import Component from '@ember/component';
import { EditAgendaitemOrSubcase } from 'fe-redpencil/mixins/edit-agendaitem-or-subcase';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import UploadDocumentMixin from 'fe-redpencil/mixins/upload-document-mixin';

export default Component.extend(EditAgendaitemOrSubcase, isAuthenticatedMixin, UploadDocumentMixin, {
	classNames: ['vl-u-spacer--large'],
	isAddingNewDocument: false,
	isEditing: false,

	didInsertElement() {
		this._super(...arguments);
		this.set('uploadedFiles', null);
		this.set('nonDigitalDocuments', null);	
	},

	async createNewDocumentWithDocumentVersion(item, file, documentTitle) {
		let document = await this.store.createRecord('document', {
			created: new Date(),
			title: documentTitle,
			type: file.get('documentType'),
			confidentiality: file.get('confidentiality')
		});

		document.save().then(async (createdDocument) => {
			const documentVersion = await this.store.createRecord('document-version', {
				document: createdDocument,
				agendaitem: item,
				created: new Date(),
				versionNumber: 1,
				file: file,
				chosenFileName: file.get('chosenFileName')
			});
			if (this.get('isAgendaItem')) {
				documentVersion.set('agendaitem', item);
			} else {
				documentVersion.set('subcase', item);
			}
			await documentVersion.save();
		})
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
			if (!this.get('uploadedFiles')) {
				this.set('uploadedFiles', []);
			}
			this.get('uploadedFiles').addObject(file);
		},

		async uploadNewDocument() {
			this.uploadFiles(this.get('item')).then(() => {
				this.get('item').hasMany('documentVersions').reload();
				this.toggleProperty('isAddingNewDocument');
			});
		}
	}
});
