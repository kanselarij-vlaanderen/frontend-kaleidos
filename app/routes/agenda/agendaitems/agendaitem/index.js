import Route from '@ember/routing/route';

export default class DetailAgendaitemAgendaitemsAgendaRoute extends Route {
  model() {
    return this.modelFor('agenda.agendaitems.agendaitem');
  }
}
