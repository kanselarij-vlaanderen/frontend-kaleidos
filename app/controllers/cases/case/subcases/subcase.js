import Controller from '@ember/controller';
import FileSaverMixin from 'ember-cli-file-saver/mixins/file-saver';
import $ from 'jquery';
import { inject } from '@ember/service';

export default Controller.extend(FileSaverMixin, {
  isUploadingNewVersion: false,
  uploadedFile: null,
  fileName: null,
  store: inject(),
  documentVersionToUse: null,

  actions: {
    async openUploadDialog(documentVersion) {
      this.set('documentVersionToUse', documentVersion);
      const uploadedFile = this.get('uploadedFile')
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
    },

    async downloadFile(documentVersion) {
      let file = await documentVersion.get('file');
      $.ajax(`/files/${file.id}?download=${file.filename}`, {
        method: 'GET',
        dataType: 'arraybuffer',
        processData: false
      })
        .then((content) => this.saveFileAs(documentVersion.nameToDisplay, content, this.get('contentType')));
    },

    async uploadNewVersion() {
      const documentVersion = await this.get('documentVersionToUse');
      const document = await documentVersion.get('document');
      const documentVersions = await this.store.query('document-version', {
        filter: {
          document: {id: document.id}
        }
      })
      const file = this.get('uploadedFile');
      let newDocumentVersion = this.store.createRecord('document-version',
        {
          file: file,
          versionNumber: documentVersions.length + 1,
          document: document,
          chosenFileName: this.get('fileName') || file.fileName,
          created: new Date()
        });
      await newDocumentVersion.save();
      this.set('uploadedFile', null);
      this.set('documentVersionToUse', null);
      this.set('fileName', null);
    }
  }
});
