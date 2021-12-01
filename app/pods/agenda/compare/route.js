import Route from '@ember/routing/route';
import { inject } from '@ember/service';
import { hash } from 'rsvp';

// TODO: octane-refactor
/* eslint-disable ember/no-get */
// eslint-disable-next-line ember/no-classic-classes
export default Route.extend({
  agendaService: inject(),

  queryParams: {
    filter: {
      refreshModel: true,
    },
  },

  model() {
    this.set('agendaService.addedPieces', []);
    this.set('agendaService.addedAgendaitems', []);
    const meeting = this.modelFor('agenda').meeting;
    const reverseSortedAgendas = this.modelFor('agenda').reverseSortedAgendas;
    return hash({
      meeting, reverseSortedAgendas,
    });
  },
});
