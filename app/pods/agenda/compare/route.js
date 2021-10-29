import Route from '@ember/routing/route';
import { inject } from '@ember/service';
import { hash } from 'rsvp';

// TODO: octane-refactor
/* eslint-disable ember/no-get */
// eslint-disable-next-line ember/no-classic-classes
export default Route.extend({
  sessionService: inject(),
  agendaService: inject(),

  queryParams: {
    filter: {
      refreshModel: true,
    },
  },

  model() {
    // TODO KAS-2777 there were 2 agendas set here, but never used, default comparing current agenda vs previous ?
    this.set('agendaService.addedPieces', []);
    this.set('agendaService.addedAgendaitems', []);
    // const agenda = this.modelFor('agenda').agenda;
    const meeting = this.modelFor('agenda').meeting;
    const reversedAgendas = this.modelFor('agenda').reverseSortedAgendas;
    // const index = agendas.lastIndexOf(agenda);
    // let agendaToCompare;
    // if (index >= 0) {
    //   agendaToCompare = agendas.objectAt(index + 1);
    // } else {
    //   agendaToCompare = agendas.objectAt(1);
    // }
    return hash({
      meeting, reversedAgendas,
    });
  },
});
