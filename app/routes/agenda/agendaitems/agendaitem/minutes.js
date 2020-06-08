import Route from '@ember/routing/route';

export default class NotulenAgendaitemAgendaitemsAgendaRoute extends Route {
  // TODO: refactor so data is sourced from the route's model hook.
  // model() {
  //   return this.modelFor('agenda.agendaitems.agendaitem').get('meetingRecord');
  // }

  setupController(controller, model) {
    super.setupController(...arguments);
    const agendaItem = this.modelFor('agenda.agendaitems.agendaitem');
    controller.set('agendaItem', agendaItem);
    controller.set('model', model);
  }
}
