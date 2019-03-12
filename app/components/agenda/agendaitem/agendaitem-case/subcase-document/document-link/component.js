import Component from '@ember/component';
import FileSaverMixin from 'ember-cli-file-saver/mixins/file-saver';
import $ from 'jquery';
import { inject } from '@ember/service';

export default Component.extend(FileSaverMixin,{
	classNames:["vl-u-spacer"],
	isShowingVersions: false,
	store: inject(),
	isUploadingNewVersion: false,
  uploadedFile: null,
	fileName: null,
	documentVersionToUse: null,

	actions: {
		showVersions() {
			this.toggleProperty('isShowingVersions');
		},

		async downloadFile(documentVersion) {
			let file = await documentVersion.get('file');
				$.ajax(`/files/${file.id}?download=${file.filename}`, {
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

		async uploadNewVersion() {
			const document = this.get('document');
			const versionNumber = document.get('lastDocumentVersion.versionNumber') + 1;
      const file = this.get('uploadedFile');
      let newDocumentVersion = this.store.createRecord('document-version',
        {
          file: file,
          versionNumber: versionNumber,
          document: document,
          chosenFileName: this.get('fileName') || file.fileName || file.name,
          created: new Date()
        });
      await newDocumentVersion.save();
      this.set('uploadedFile', null);
      this.set('fileName', null);
      this.set('isUploadingNewVersion', false);
      document.hasMany('documentVersions').reload();
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
