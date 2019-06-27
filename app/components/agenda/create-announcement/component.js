import Component from '@ember/component';
import { inject } from '@ember/service';
import UploadDocumentMixin from 'fe-redpencil/mixins/upload-document-mixin';
import moment from 'moment';

export default Component.extend(UploadDocumentMixin, {
  store: inject(),
  classNames: ["vlc-panel-layout__main-content"],
  modelToAddDocumentVersionTo: 'agendaitem',
  isAddingAnnouncement: null,

  actions: {
    closeDialog() {
      this.toggleProperty('isAddingAnnouncement');
    },

    async createAnnouncement() {
      const { title, text, currentAgenda } = this;
      const date = moment().utc().toDate();
      const agenda = await this.store.findRecord('agenda', currentAgenda.get('id'))

      const agendaitem = this.store.createRecord('agendaitem',
        {
          shortTitle: title,
          title: text,
          agenda: agenda,
          showAsRemark: true,
          created: date
        });
      await agendaitem.save();

      await this.uploadFiles(agendaitem);
      await agenda.hasMany('agendaitems').reload();
      this.reloadRoute(agenda.get('id'))
      this.toggleProperty('isAddingAnnouncement');
    },

    chooseDocumentType(uploadedFile, type) {
      uploadedFile.set('documentType', type);
    },
  },
});
