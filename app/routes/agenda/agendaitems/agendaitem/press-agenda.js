import Route from '@ember/routing/route';

export default class PressAgendaAgendaitemAgendaitemsAgendaRoute extends Route {
  setupController(controller, model) {
    super.setupController(...arguments);
    const agendaItem = this.modelFor('agenda.agendaitems.agendaitem');
    controller.set('agendaItem', agendaItem);
    controller.set('model', model);
  }
}
