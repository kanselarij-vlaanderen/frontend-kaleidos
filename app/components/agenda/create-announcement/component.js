import Component from '@ember/component';
import { inject } from '@ember/service';
import UploadDocumentMixin from 'fe-redpencil/mixins/upload-document-mixin';
import moment from 'moment';
import CONFIG from 'fe-redpencil/utils/config';
import { alias } from '@ember/object/computed';
import { A } from '@ember/array';

export default Component.extend(UploadDocumentMixin, {
  store: inject(),
  model: alias('uploadedFiles'),

  classNames: ['vlc-panel-layout__main-content'],
  isAddingAnnouncement: null,
  creatingAnnouncement: false,
  init() {
    this._super(...arguments);
    this.set('model', A([]));
  },

  actions: {
    closeDialog() {
      this.toggleProperty('isAddingAnnouncement');
    },

    add(file) {
      this.get('model').pushObject(file);
      this.send('uploadedFile', file);
    },

    delete(file) {
      file.destroyRecord().then(() => {
        this.get('model').removeObject(file);
      });
    },

    async createAnnouncement() {
      this.toggleProperty('creatingAnnouncement');
      const { title, text, currentAgenda } = this;
      const date = moment()
        .utc()
        .toDate();
      const agenda = await this.store.findRecord('agenda', currentAgenda.get('id'));
      const lastAnnouncementPriority = await agenda.lastAnnouncementPriority;
      const agendaitem = await this.store.createRecord('agendaitem', {
        shortTitle: title,
        title: text,
        agenda,
        showAsRemark: true,
        created: date,
        formallyOk: CONFIG.notYetFormallyOk,
        priority: lastAnnouncementPriority + 1,
      });
      await this.addDocumentVersions(agendaitem);
      await currentAgenda.hasMany('agendaitems').reload();
      this.reloadRouteWithRefreshId(agendaitem.get('id'));
      this.toggleProperty('isAddingAnnouncement');
      this.toggleProperty('creatingAnnouncement');
    },
  },

  async addDocumentVersions(agendaitem) {
    const documents = await this.saveDocuments(null);
    await Promise.all(
      documents.map(async (document) => {
        const documentVersions = await document.get('documentVersions');
        return this.attachDocumentVersionsToModel(documentVersions, agendaitem);
      })
    );
    return await agendaitem.save();
  },
});
