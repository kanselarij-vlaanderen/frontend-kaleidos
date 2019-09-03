import Component from '@ember/component';
import { inject } from '@ember/service';
import UploadDocumentMixin from 'fe-redpencil/mixins/upload-document-mixin';
import moment from 'moment';
import { alias } from '@ember/object/computed';
import { A } from '@ember/array';

export default Component.extend(UploadDocumentMixin, {
  store: inject(),
  model: alias('uploadedFiles'),

  classNames: ['vlc-panel-layout__main-content'],
  isAddingAnnouncement: null,

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
      const { title, text, currentAgenda } = this;
      const date = moment()
        .utc()
        .toDate();
      const agenda = await this.store.findRecord('agenda', currentAgenda.get('id'));

      const agendaitem = this.store.createRecord('agendaitem', {
        shortTitle: title,
        title: text,
        agenda,
        showAsRemark: true,
        created: date,
      });
      await this.addDocumentVersions(agendaitem);
      currentAgenda.hasMany('agendaitems').reload();
      this.reloadRoute(agenda.get('id'))
      this.toggleProperty('isAddingAnnouncement');
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
    return agendaitem.save();
  },
});
