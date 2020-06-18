import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { task, all } from 'ember-concurrency';

export default Route.extend({
  async model() {
    const { meeting, agenda } = this.modelFor('agenda');
    const agendaitems = await this.store.query('agendaitem', {
      filter: { agenda: { id: agenda.id } },
      include: 'mandatees',
    });
    const notas = agendaitems.filter((item) => !item.showAsRemark).sortBy('priority');
    await this.ensureDocuments.perform(notas);
    const announcements = agendaitems.filter((item) => item.showAsRemark).sortBy('priority');
    await this.ensureDocuments.perform(announcements);

    return hash({
      meeting,
      notas,
      announcements,
    });
  },

  ensureDocuments: task(function* (agendaItems) {
    const tasks = [];
    for (const item of agendaItems) {
      if (!item.hasMany('documentVersions').value()) {
        tasks.push(this.loadDocuments.perform(item));
      }
    }
    yield all(tasks);
  }),

  loadDocuments: task(function* (agendaItem) {
    yield agendaItem.hasMany('documentVersions').reload({ adapterOptions: { namesOnly: true } });
  }).maxConcurrency(2).enqueue(),

});
