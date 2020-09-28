import Route from '@ember/routing/route';

export default class PressAgendaAgendaitemAgendaitemsAgendaRoute extends Route {
  setupController(controller, model) {
    super.setupController(...arguments);
    const agendaitem = this.modelFor('agenda.agendaitems.agendaitem');
    controller.set('agendaitem', agendaitem);
    controller.set('model', model);
  }
}
