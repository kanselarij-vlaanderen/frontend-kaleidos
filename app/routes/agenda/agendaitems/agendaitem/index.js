import Route from '@ember/routing/route';

export default class DetailAgendaitemAgendaitemsAgendaRoute extends Route {
  model() {
    return this.modelFor('agenda.agendaitems.agendaitem');
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    const agenda = this.modelFor('agenda').agenda;
    controller.set('agenda', agenda);
    controller.set('model', model);
  }
}
