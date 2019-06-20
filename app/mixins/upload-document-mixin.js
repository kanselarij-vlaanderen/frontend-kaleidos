import Mixin from '@ember/object/mixin';
import FileSaverMixin from 'ember-cli-file-saver/mixins/file-saver';
import { notifyPropertyChange } from '@ember/object';
import $ from 'jquery';
import { inject } from '@ember/service';
import moment from 'moment';

/**
 * @param modelToAddDocumentVersionTo:String Is the model where the relation of document-version should be set to.
 */
export default Mixin.create(FileSaverMixin, {
	modelToAddDocumentVersionTo: null,
	uploadedFiles: null,
	nonDigitalDocuments: null,
	store: inject(),

	async createNewDocumentWithDocumentVersion(model, file, documentTitle) {
		const { modelToAddDocumentVersionTo } = this;
		const creationDate = moment().utc().toDate();
		let type, chosenFileName;
		if (file) { //If no file, the file is not digitally available, should asked at the `archive`
			chosenFileName = file.get('chosenFileName') || file.get('filename') || file.get('name');
			type = file.get('documentType');
		} else {
			chosenFileName = documentTitle;
		}
		let document = await this.store.createRecord('document', {
			created: creationDate,
			title: documentTitle,
			type: type,
		});
		const modelName = model.get('constructor.modelName');

		if (modelName == "meeting-record" || modelName == "decision") {
			document.set(modelToAddDocumentVersionTo, model);
		}

		await document.save().then(async (createdDocument) => {
			const documentVersion = await this.store.createRecord('document-version', {
				document: createdDocument,
				created: creationDate,
				file: file,
				versionNumber: 1,
				chosenFileName: chosenFileName
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
		this.set('uploadedFiles', null);
		this.set('nonDigitalDocuments', null);
	},

	async createNewDocumentVersion(uploadedFile, document, versionNumber) {
		const { item, modelToAddDocumentVersionTo } = this;
		const latestDocumentVersion = versionNumber || 0;
		const newDocumentVersion = await this.createVersion(uploadedFile, latestDocumentVersion);
		newDocumentVersion.set(modelToAddDocumentVersionTo, (await item));

		if (document) {
			newDocumentVersion.set('document', document);
		}

		await newDocumentVersion.save();
		return item.reload();

	},

	createVersion(uploadedFile, latestVersionNumber) {
		return this.store.createRecord('document-version',
			{
				file: uploadedFile,
				versionNumber: latestVersionNumber + 1,
				chosenFileName: uploadedFile.get('chosenFileName') || uploadedFile.get('fileName'),
				created: moment().utc().toDate()
			});
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

		async downloadFile(version) {
			const documentVersion = await version;
			let file = await documentVersion.get('file');
			$.ajax(`/files/${file.id}/download?name=${file.filename}`, {
				method: 'GET',
				dataType: 'arraybuffer', // or 'blob'
				processData: false
			})
				.then((content) => this.saveFileAs(documentVersion.nameToDisplay, content, file.get('contentType')));
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

		async showDocumentVersionViewer(documentVersion) {
			window.open(`/document/${(await documentVersion).get('id')}`);
		}
	}
});
