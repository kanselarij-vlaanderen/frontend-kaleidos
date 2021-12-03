import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import {
  task, all
} from 'ember-concurrency';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes
export default Route.extend({
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
    const notas = agendaitems.filter((agendaitem) => !agendaitem.showAsRemark).sortBy('number');
    // await this.ensureDocuments.perform(notas); // TODO KAS-1992 documents are loaded in component
    const announcements = agendaitems.filter((agendaitem) => agendaitem.showAsRemark).sortBy('number');
    // await this.ensureDocuments.perform(announcements); // TODO KAS-1992 documents are loaded in component

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
