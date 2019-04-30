import Mixin from '@ember/object/mixin';
import { notifyPropertyChange } from '@ember/object';
import $ from 'jquery';
/**
 * @param modelToAddDocumentVersionTo:String Is the model where the relation of document-version should be set to.
 */
export default Mixin.create({
	modelToAddDocumentVersionTo: null,
	uploadedFiles: null,
	nonDigitalDocuments: null,

	async createNewDocumentWithDocumentVersion(model, file, documentTitle) {
		const { modelToAddDocumentVersionTo } = this;
		const creationDate = new Date();
		let type, confidentiality, chosenFileName;
		if (file) { //If no file, the file is not digitally available, should asked at the `archive`
			chosenFileName = file.get('chosenFileName');
			type = file.get('documentType');
			confidentiality = file.get('confidentiality');
		} else {
			chosenFileName = documentTitle;
		}
		let document = await this.store.createRecord('document', {
			created: creationDate,
			title: documentTitle,
			type: type,
			confidentiality: confidentiality
		});

		document.save().then(async (createdDocument) => {
			const documentVersion = await this.store.createRecord('document-version', {
				document: createdDocument,
				model: model,
				created: creationDate,
				file: file,
				versionNumber: 1,
				chosenFileName: chosenFileName // Static because it's a new document.
			});
			documentVersion.set(modelToAddDocumentVersionTo, model);

			await documentVersion.save();
		});
	},

	async uploadFiles(model) {
		const { uploadedFiles, nonDigitalDocuments } = this;
		if (uploadedFiles) {
			await Promise.all(uploadedFiles.map(uploadedFile => {
				if (uploadedFile.id) {
					return this.createNewDocumentWithDocumentVersion(model, uploadedFile, uploadedFile.get('name'));
				}
			}));
		}

		if (nonDigitalDocuments) {
			await Promise.all(nonDigitalDocuments.map(nonDigitalDocument => {
				if (nonDigitalDocument.title) {
					return this.createNewDocumentWithDocumentVersion(model, null, nonDigitalDocument.title);
				}
			}));
		}
	},

	actions: {
		uploadedFile(uploadedFile) {
			const { uploadedFiles } = this;
			if (uploadedFiles) {
				uploadedFiles.pushObject(uploadedFile);
			} else {
				this.set('uploadedFiles', [uploadedFile]);
			}
		},

		removeDocument(document) {
			this.get('nonDigitalDocuments').removeObject(document);
		},

		createNonDigitalDocument() {
			const { nonDigitalDocuments, documentTitle, documentDescription } = this;
			const newNonDigitalDocument = {
				title: documentTitle,
				description: documentDescription
			};
			if (nonDigitalDocuments) {
				nonDigitalDocuments.addObject(newNonDigitalDocument);
			} else {
				this.set('nonDigitalDocuments', [newNonDigitalDocument])
			}
			notifyPropertyChange(this, 'nonDigitalDocuments');
			this.set('documentTitle', null);
			this.set('documentDescription', null);
		},

		toggleAddNonDigitalDocument() {
			this.toggleProperty('isAddingNonDigitalDocument')
		},

		removeFile(file) {
			$.ajax({
				method: "DELETE",
				url: '/files/' + file.id
			})
			this.get('uploadedFiles').removeObject(file);
		},
	}
});
