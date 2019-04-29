import Component from '@ember/component';
import { inject } from '@ember/service';
import UploadDocumentMixin from 'fe-redpencil/mixins/upload-document-mixin';

export default Component.extend(UploadDocumentMixin,{
  store: inject(),
  classNames: ["vlc-panel-layout__main-content"],
  modelToAddDocumentVersionTo: 'agendaitem',
  isAddingAnnouncement: null,

  actions: {
    closeDialog() {
      this.toggleProperty('isAddingAnnouncement');
    },
    async createAnnouncement() {
      const { title, text, currentAgenda, uploadedFiles, nonDigitalDocuments } = this;
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

      if (uploadedFiles) {
        await Promise.all(uploadedFiles.map(uploadedFile => {
          if (uploadedFile.id) {
            return this.createNewDocumentWithDocumentVersion(agendaitem, uploadedFile, uploadedFile.get('name'));
          }
        }));
      }

      if (nonDigitalDocuments) {
        await Promise.all(nonDigitalDocuments.map(nonDigitalDocument => {
          if (nonDigitalDocument.title) {
            return this.createNewDocumentWithDocumentVersion(agendaitem, null, nonDigitalDocument.title);
          }
        }));
      }

      this.toggleProperty('isAddingAnnouncement');
      this.reloadRoute(currentAgenda.get('id'));
    },

    chooseDocumentType(uploadedFile, type) {
      uploadedFile.set('documentType', type);
    },
  },
});
