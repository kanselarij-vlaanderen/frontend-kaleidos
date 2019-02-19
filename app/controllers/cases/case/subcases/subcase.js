import Controller from '@ember/controller';
import FileSaverMixin from 'ember-cli-file-saver/mixins/file-saver';
import $ from 'jquery';
import { inject } from '@ember/service';

export default Controller.extend(FileSaverMixin, {
  isUploadingNewVersion: false,
  uploadedFile: null,
  fileName: null,
  store:inject(),
  documentToUploadNewVersionOf:null,

  actions: {
    openUploadDialog(document) {
      if(document && document.id) {
        this.set('documentToUploadNewVersionOf', document);
      }
      const uploadedFile = this.get('uploadedFile')
      if(uploadedFile && uploadedFile.id) {
        this.deleteFile(uploadedFile.id);
      }
      this.toggleProperty('isUploadingNewVersion');
    },

    async getUploadedFile(file) {
      this.set('fileName', file.filename)
      this.set('uploadedFile', file);
    },

    removeFile() {
      this.deleteFile(this.get('uploadedFile.id'));
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
      const document = await this.get('documentToUploadNewVersionOf');
      const documentVersions = await document.get('documentVersions');
      const file = this.get('uploadedFile');
      let newDocumentVersion = this.store.createRecord('document-version',
      {
        file: file,
        versionNumber: documentVersions.length + 1 ,
        document: document,
        chosenFileName: this.get('fileName') || file.fileName,
        created: new Date()
      });
      await newDocumentVersion.save();
      this.set('uploadedFile', null);
      this.set('documentToUploadNewVersionOf', null);
      this.set('fileName', null);
    }
  },

  deleteFile(id) {
    $.ajax({
      method: "DELETE",
      url: '/files/' + id
    }).then(() => {
      this.set('uploadedFile', null);
    })
  },
});
