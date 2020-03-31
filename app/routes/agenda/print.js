import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { task, all } from 'ember-concurrency';

export default Route.extend({
  async model(params) {
    const meeting = this.modelFor('agenda');
    let agendaId = params.selectedAgenda;
		if (!agendaId) {
      const allAgendas = await meeting.get('agendas');
      agendaId = allAgendas.get('firstObject').id;
		}
    let agendaitems = await this.store.query('agendaitem', {
      filter: { agenda: { id: agendaId } },
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

  ensureDocuments: task(function*(agendaItems) {
    const tasks = []
    for (var item of agendaItems) {
      if (!item.hasMany('documentVersions').value()) {
        tasks.push(this.loadDocuments.perform(item));
      }
    }
    yield all(tasks);
  }),

  loadDocuments: task(function*(agendaItem) {
    yield agendaItem.hasMany('documentVersions').reload({ adapterOptions: { namesOnly: true}});
  }).maxConcurrency(2).enqueue()

});