import Component from '@ember/component';
import FileSaverMixin from 'ember-cli-file-saver/mixins/file-saver';
import $ from 'jquery';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
export default Component.extend(FileSaverMixin, {
	classNames: ["vl-u-spacer"],
	isShowingVersions: false,
	store: inject(),
	isUploadingNewVersion: false,
	uploadedFile: null,
	fileName: null,

	isAgendaItem: computed('item', function () {
		const { item } = this;
		const modelName = item.get('constructor.modelName')
		return modelName === 'agendaitem';
	}),

	filteredDocumentVersions: computed('document.documentVersions.@each', async function () {
		let documentVersions = await this.store.query('document-version', {
			filter: { document: { id: await this.get('document.id') } },
			sort: '-version-number'
		});
		return documentVersions;
	}),

	filteredDocumentVersionsLength: computed('filteredDocumentVersions', function () {
		return this.get('filteredDocumentVersions.length');
	}),

	async createNewDocumentVersion(document, newVersion) {			
		const { item, uploadedFile, isAgendaItem} = this;
		let newDocumentVersion ;
		if(isAgendaItem) {
			newDocumentVersion = this.store.createRecord('document-version',
			{
				file: uploadedFile,
				versionNumber: parseInt(await newVersion.get('versionNumber') + 1),
				document: document,
				agendaitem: item,
				chosenFileName: this.get('fileName') || uploadedFile.fileName || uploadedFile.name,
				created: new Date()
			});
		} else {
			newDocumentVersion = this.store.createRecord('document-version',
			{
				file: uploadedFile,
				versionNumber: parseInt(await newVersion.get('versionNumber') + 1),
				document: document,
				subcase: item,
				chosenFileName: this.get('fileName') || uploadedFile.fileName || uploadedFile.name,
				created: new Date()
			});
		}
		
		return newDocumentVersion.save();
	},

	actions: {
		showVersions() {
			this.toggleProperty('isShowingVersions');
		},

		async uploadNewVersion() {
			const document = await this.get('document');
			const newVersion = await document.get('lastDocumentVersion');
			const newDocumentVersion = await this.createNewDocumentVersion(document, newVersion)

			document.set('lastDocumentVersion', newDocumentVersion);

			if(this.get('isAgendaItem')) {
				await document.createNextAgendaVersionIdentifier(this.get('item'), newDocumentVersion);
			}
			document.hasMany('documentVersions').reload();
			this.get('item').reload();
			this.set('isUploadingNewVersion', false);
		},

		async downloadFile(documentVersion) {
			let file = await documentVersion.get('file');
			$.ajax(`/files/${file.id}/download?name=${file.filename}`, {
				method: 'GET',
				dataType: 'arraybuffer', // or 'blob'
				processData: false
			})
				.then((content) => this.saveFileAs(documentVersion.nameToDisplay, content, this.get('contentType')));
		},

		async openUploadDialog() {
			const uploadedFile = this.get('uploadedFile');
			if (uploadedFile && uploadedFile.id) {
				this.deleteFile(uploadedFile.id);
			}
			this.toggleProperty('isUploadingNewVersion');
		},

		async createNewDocumentWithDocumentVersion(subcase, file, documentTitle) {
			let document = await this.store.createRecord('document', {
				created: new Date(),
				title: documentTitle,
				type: file.get('documentType')
			});
			document.save().then(async (createdDocument) => {
				if (file) {
					const documentVersion = await this.store.createRecord('document-version', {
						document: createdDocument,
						subcase: subcase,
						created: new Date(),
						versionNumber: 1,
						file: file,
						chosenFileName: file.get('name')
					});
					await documentVersion.save();
				} else {
					const documentVersion = await this.store.createRecord('document-version', {
						document: createdDocument,
						subcase: subcase,
						created: new Date(),
						versionNumber: 1,
						chosenFileName: documentTitle
					});
					await documentVersion.save();
				}
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
	}
});
