import Route from '@ember/routing/route';
import { inject } from '@ember/service';
import { hash } from 'rsvp';

export default Route.extend({
  sessionService: inject(),
  agendaService: inject(),

  queryParams: {
    filter: {
      refreshModel: true,
    },
  },

  async model() {
    this.set('agendaService.addedDocuments', []);
    this.set('agendaService.addedAgendaitems', []);
    this.set('sessionService.selectedAgendaitem', null);
    const agenda = await this.get('sessionService.currentAgenda');
    const session = this.modelFor('agenda').meeting;
    const agendas = await session.get('agendas');
    const index = agendas.lastIndexOf(agenda);
    let agendaToCompare;
    if (index >= 0) {
      agendaToCompare = agendas.objectAt(index + 1);
    } else {
      agendaToCompare = agendas.objectAt(1);
    }
    return hash({
      currentAgenda: agenda, agendaToCompare,
    });
  },
});
