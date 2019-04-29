import Component from '@ember/component';
import FileSaverMixin from 'ember-cli-file-saver/mixins/file-saver';
import $ from 'jquery';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import UploadDocumentMixin from 'fe-redpencil/mixins/upload-document-mixin';

export default Component.extend(FileSaverMixin, isAuthenticatedMixin, UploadDocumentMixin, {
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

	filteredDocumentVersions: computed('document', 'document.documentVersions', 'item', 'item.documents.@each', function () {
		return this.get('document').getDocumentVersionsOfItem(this.get('item'));
	}),

	lastDocumentVersion: computed('filteredDocumentVersions.@each', async function () {
		return (await this.get('filteredDocumentVersions') || []).objectAt(0);
	}),

	async createNewDocumentVersion(document, newVersion) {
		const { item, uploadedFile, isAgendaItem } = this;
		let newDocumentVersion = this.store.createRecord('document-version',
			{
				file: uploadedFile,
				versionNumber: parseInt(await newVersion.get('versionNumber') + 1),
				document: document,
				chosenFileName: this.get('fileName') || uploadedFile.fileName || uploadedFile.name,
				created: new Date()
			});
		if (isAgendaItem) {
			newDocumentVersion.set('agendaitem', item);
		} else {
			newDocumentVersion.set('subcase', item);
		}
		return newDocumentVersion.save();
	},

	actions: {
		showVersions() {
			this.toggleProperty('isShowingVersions');
		},

		async uploadNewVersion() {
			const { item, isAgendaItem } = this;
			const document = await this.get('document');
			const newVersion = await document.get('lastDocumentVersion');
			const newDocumentVersion = await this.createNewDocumentVersion(document, newVersion)

			document.set('lastDocumentVersion', newDocumentVersion);
			if (isAgendaItem) {
				item.get('documentVersions').addObject(newDocumentVersion);
				await item.save();
			}
			await item.hasMany('documentVersions').reload();
			if(!this.get('isDestroyed')) {
				this.set('isUploadingNewVersion', false);
			}
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
