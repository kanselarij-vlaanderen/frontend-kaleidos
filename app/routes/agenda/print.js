import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import {
  task, all
} from 'ember-concurrency';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes
export default Route.extend({
  store: service(),

  async model() {
    const {
      meeting, agenda,
    } = this.modelFor('agenda');
    const agendaitems = await this.store.query('agendaitem', {
      filter: {
        agenda: {
          id: agenda.id,
        },
      },
      include: 'mandatees',
    });
    const notas = []
    const announcements = [];
    for (const agendaitem of agendaitems.sortBy('number').toArray()) {
      const type = await agendaitem.type;
      if (type.uri === CONSTANTS.AGENDA_ITEM_TYPES.NOTA) {
        notas.push(agendaitem);
      } else {
        announcements.push(agendaitem);
      }
    }
    await this.ensureDocuments.perform(notas);
    await this.ensureDocuments.perform(announcements);

    return hash({
      meeting,
      notas,
      announcements,
    });
  },

  ensureDocuments: task(function *(agendaitems) {
    const tasks = [];
    for (const agendaitem of agendaitems) {
      if (!agendaitem.hasMany('pieces').value()) {
        tasks.push(this.loadDocuments.perform(agendaitem));
      }
    }
    yield all(tasks);
  }),

  loadDocuments: task(function *(agendaitem) {
    yield agendaitem.hasMany('pieces').reload({
      adapterOptions: {
        namesOnly: true,
      },
    });
  }).maxConcurrency(2)
    .enqueue(),

});
