import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { task } from 'ember-concurrency';

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
    await this.ensureDocuments(notas);
    const announcements = agendaitems.filter((item) => item.showAsRemark).sortBy('priority');
    await this.ensureDocuments(announcements);

    return hash({
      meeting,
      notas,
      announcements,
    });
  },

  async ensureDocuments(agendaItems) {
    for (var item of agendaItems) {
      if (!item.hasMany('documentVersions').value()) {
        await this.loadDocuments.perform(item);
      }
    }
  },

  loadDocuments: task(function*(agendaItem) {
    yield agendaItem.hasMany('documentVersions').reload();
  }).maxConcurrency(2).enqueue(),

});
