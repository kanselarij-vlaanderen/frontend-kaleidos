import Component from '@ember/component';
import { inject } from '@ember/service';
import { notifyPropertyChange } from '@ember/object';
import $ from 'jquery';

export default Component.extend({
  classNames: ["vlc-panel-layout__main-content"],
  store: inject(),
  uploadedFiles: [],
  nonDigitalDocuments: [],

  actions : {
    async createAnnouncement (){
      const { title, text } = this;
      const agenda = await this.get('currentAgenda');
      const announcement = this.store.createRecord('announcement', { title, text, created: new Date(), modified: new Date(), agenda });
      await announcement.save();

      const uploadedFiles = this.get('uploadedFiles');

      Promise.all(uploadedFiles.map(uploadedFile => {
        if(uploadedFile.id) {
          return this.createNewDocumentWithDocumentVersion(announcement, uploadedFile, uploadedFile.get('name'));
        }
      }));
      const nonDigitalDocuments = this.get('nonDigitalDocuments');

      Promise.all(nonDigitalDocuments.map(nonDigitalDocument => {
        if(nonDigitalDocument.title) {
          return this.createNewDocumentWithDocumentVersion(announcement, null, nonDigitalDocument.title);
        }
      }));


      this.navigateToNewAnnouncement(announcement);
      notifyPropertyChange(agenda, 'announcements');
    },

    uploadedFile(uploadedFile) {
      uploadedFile.set('public', true);
      this.get('uploadedFiles').pushObject(uploadedFile);
    },


    chooseDocumentType(uploadedFile, type) {
      uploadedFile.set('documentType', type.name || type.description);
    },

    removeFile(file) {
      $.ajax({
        method: "DELETE",
        url: '/files/' + file.id
      })
      this.get('uploadedFiles').removeObject(file);
    },

    removeDocument(document) {
      this.get('nonDigitalDocuments').removeObject(document);
    },

    createNonDigitalDocument() {
      this.nonDigitalDocuments.push({title: this.get('documentTitle')});
      notifyPropertyChange(this, 'nonDigitalDocuments');
      this.set('documentTitle', null);
    },

    toggleAddNonDigitalDocument() {
      this.toggleProperty('isAddingNonDigitalDocument')
    },
  },
    async createNewDocumentWithDocumentVersion(announcement, file, documentTitle) {
      let document = await this.store.createRecord('document', {
        created: new Date(),
        title: documentTitle
        // documentType: file.get('documentType')
      });
      document.save().then(async (createdDocument) => {
        if(file) {
          delete file.public;
          const documentVersion = await this.store.createRecord('document-version', {
            document: createdDocument,
            announcement: announcement,
            created: new Date(),
            versionNumber: 1,
            file:file,
            chosenFileName: file.get('name')
          });
          await documentVersion.save();
        } else {
          const documentVersion = await this.store.createRecord('document-version', {
            document: createdDocument,
            announcement: announcement,
            created: new Date(),
            versionNumber: 1,
            chosenFileName: documentTitle
          });
          await documentVersion.save();
        }
      });
    }
});
