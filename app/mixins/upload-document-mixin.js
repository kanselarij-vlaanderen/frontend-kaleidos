import Mixin from '@ember/object/mixin';
import FileSaverMixin from 'ember-cli-file-saver/mixins/file-saver';
import { notifyPropertyChange } from '@ember/object';
import $ from 'jquery';
import { inject } from '@ember/service';
import moment from 'moment';
import { computed } from '@ember/object';
/**
 * @param modelToAddDocumentVersionTo:String Is the model where the relation of document-version should be set to.
 */
export default Mixin.create(FileSaverMixin, {
	modelToAddDocumentVersionTo: null,
	uploadedFiles: null,
	nonDigitalDocuments: null,
	store: inject(),
	fileService: inject(),

	isAgendaItem: computed('modelToAddDocumentVersionTo', function () {
		return (this.get('modelToAddDocumentVersionTo') === 'agendaitem');
	}),

	async createNewDocumentWithDocumentVersion(model, file, documentTitle) {
		const { modelToAddDocumentVersionTo } = this;
		const confidential = model.get('confidential');
		const creationDate = moment().utc().toDate();
		let type, chosenFileName;
		if (file) {
			chosenFileName = file.get('chosenFileName') || file.get('filename') || file.get('name');
			type = file.get('documentType');
		} else {
			chosenFileName = documentTitle;
		}

		let document = this.store.createRecord('document', {
			created: creationDate,
			title: documentTitle,
			type: type,
			freezeAccessLevel: confidential
		});
		const modelName = await model.get('constructor.modelName');

		if (modelName == "meeting-record" || modelName == "decision") {
			document.set(modelToAddDocumentVersionTo, model);
		}

		document.save().then((createdDocument) => {
			const documentVersion = this.store.createRecord('document-version', {
				document: createdDocument,
				created: creationDate,
				file: file,
				versionNumber: 1,
				chosenFileName: chosenFileName
			});
			if (!(modelName == "meeting-record" || modelName == "decision")) {
				documentVersion.set(modelToAddDocumentVersionTo, model);
			}
			documentVersion.save().then((createdDocumentVersion) => {
				model.hasMany('documentVersions').reload();
				if (file.get('extension') === "docx") {
					try {
						this.fileService.convertDocumentVersionById(createdDocumentVersion.get('id')).then((convertedMessage) => {
							return convertedMessage;
						});
					} catch (e) {
						// TODO: Handle errors
					}
				}
				if (modelName == "meeting-record" || modelName == "decision") {
					model.set('signedDocument', createdDocument);
				}

			});
		});
	},

	async uploadFiles(model) {
		const { uploadedFiles } = this;
		if (uploadedFiles) {
			await Promise.all(uploadedFiles.map(uploadedFile => {
				if (uploadedFile.id) {
					return this.createNewDocumentWithDocumentVersion(model, uploadedFile, uploadedFile.get('name'));
				}
			}));
		}

		this.set('uploadedFiles', null);
		this.set('nonDigitalDocuments', null);
		this.set('isLoading', false);
	},

	async createNewDocumentVersion(uploadedFile, document, versionNumber) {
		const { item, modelToAddDocumentVersionTo } = this;
		const latestDocumentVersion = versionNumber || 0;
		const newDocumentVersion = await this.createVersion(uploadedFile, latestDocumentVersion);
		newDocumentVersion.set(modelToAddDocumentVersionTo, (await item));

		if (document) {
			newDocumentVersion.set('document', document);
		}

		const savedDocumentVersion = await newDocumentVersion.save();
		const extension = await savedDocumentVersion.get('file.extension');
		if (extension === "docx") {
			try {
				await this.fileService.convertDocumentVersionById(savedDocumentVersion.get('id'));
			} catch (e) {
				// TODO: Handle errors
			}
		}
		return savedDocumentVersion;
	},

	createVersion(uploadedFile, latestVersionNumber) {
		return this.store.createRecord('document-version',
			{
				file: uploadedFile,
				versionNumber: latestVersionNumber + 1,
				chosenFileName: uploadedFile.get('chosenFileName') || uploadedFile.get('filename') || uploadedFile.get('name'),
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
