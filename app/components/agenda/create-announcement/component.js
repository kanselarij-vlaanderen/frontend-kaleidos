import Component from '@ember/component';
import { inject } from '@ember/service';
import { notifyPropertyChange } from '@ember/object';
import $ from 'jquery';

export default Component.extend({
  classNames: ["vlc-panel-layout__main-content"],
  store: inject(),
  uploadedFiles: null,
  nonDigitalDocuments: null,
  isAddingAnnouncement: null,

  actions: {
    closeDialog() {
      this.toggleProperty('isAddingAnnouncement');
    },
    async createAnnouncement() {
      const { title, text, currentAgenda } = this;
      const date = new Date();
      const agendaitem = this.store.createRecord('agendaitem',
        {
          shortTitle: title,
          title: text,
          agenda: currentAgenda,
          showAsRemark: true,
          created: date
        });
      await agendaitem.save();

      const uploadedFiles = this.get('uploadedFiles');
      if (uploadedFiles) {
        await Promise.all(uploadedFiles.map(uploadedFile => {
          if (uploadedFile.id) {
            return this.createNewDocumentWithDocumentVersion(agendaitem, uploadedFile, uploadedFile.get('name'));
          }
        }));
      }

      const nonDigitalDocuments = this.get('nonDigitalDocuments');
      if (nonDigitalDocuments) {
        await Promise.all(nonDigitalDocuments.map(nonDigitalDocument => {
          if (nonDigitalDocument.title) {
            return this.createNewDocumentWithDocumentVersion(agendaitem, null, nonDigitalDocument.title);
          }
        }));
      }

      this.toggleProperty('isAddingAnnouncement');
      this.reloadRoute(currentAgenda.get('id'))
    },

    uploadedFile(uploadedFile) {
      uploadedFile.set('public', true);
      const uploadedFiles = this.get('uploadedFiles');
      if (uploadedFiles) {
        this.get('uploadedFiles').pushObject(uploadedFile);
      } else {
        this.set('uploadedFiles', [uploadedFile])
      }
    },

    chooseDocumentType(uploadedFile, type) {
      uploadedFile.set('documentType', type);
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
      this.nonDigitalDocuments.push({ title: this.get('documentTitle') });
      notifyPropertyChange(this, 'nonDigitalDocuments');
      this.set('documentTitle', null);
    },

    toggleAddNonDigitalDocument() {
      this.toggleProperty('isAddingNonDigitalDocument')
    },
  },
  async createNewDocumentWithDocumentVersion(agendaitem, file, documentTitle) {
    let document = await this.store.createRecord('document', {
      created: new Date(),
      title: documentTitle,
      type: file.get('documentType')
    });
    document.save().then(async (createdDocument) => {
      if (file) {
        delete file.public;
        const documentVersion = await this.store.createRecord('document-version', {
          document: createdDocument,
          agendaitem: agendaitem,
          created: new Date(),
          versionNumber: 1,
          file: file,
          chosenFileName: file.get('name')
        });
        await documentVersion.save();
      } else {
        const documentVersion = await this.store.createRecord('document-version', {
          document: createdDocument,
          agendaitem: agendaitem,
          created: new Date(),
          versionNumber: 1,
          chosenFileName: documentTitle
        });
        await documentVersion.save();
      }
    });
  }
});
