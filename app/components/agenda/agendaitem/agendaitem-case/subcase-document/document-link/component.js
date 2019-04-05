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

	filteredDocumentVersions: computed('document.documentVersions', function () {
		return this.get('document.documentVersions').then((versions) => {
			return versions.filter((version) => version.get('versionNumber') != 1).sortBy('versionNumber');
		})
	}),

	filteredDocumentVersionsLength: computed('filteredDocumentVersions', function () {
		return this.get('filteredDocumentVersions.length');
	}),

	actions: {
		showVersions() {
			this.toggleProperty('isShowingVersions');
		},

		async uploadNewVersion() {
			const document = await this.get('document');
			const newVersion = await document.get('lastDocumentVersion');
			const file = this.get('uploadedFile');
			let newDocumentVersion = this.store.createRecord('document-version',
				{
					file: file,
					versionNumber: newVersion.get('versionNumber') + 1,
					document: document,
					subcase: this.get('subcase'),
					chosenFileName: this.get('fileName') || file.fileName || file.name,
					created: new Date()
				});
			await newDocumentVersion.save();
			document.set('lastDocumentVersion', newDocumentVersion);

			if (this.get('agendaitem')) {
				await document.createNextAgendaVersionIdentifier(this.get('agendaitem'), newDocumentVersion);
			}
			document.hasMany('documentVersions').reload();
			document.notifyPropertyChange('documentVersions');
			if (this.get('subcase')) {
				this.get('subcase').notifyPropertyChange('documents');
			}
			// this.set('isUploadingNewVersion', false);
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
