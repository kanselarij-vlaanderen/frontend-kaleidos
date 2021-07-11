import Route from '@ember/routing/route';

export default class AgendaitemAgendaitemsAgendaRoute extends Route {
  model(params) {
    return this.store.findRecord('agendaitem', params.agendaitem_id, {
      include: [
        'agenda-activity',
        'agenda-activity.subcase',
        'agenda-activity.subcase.requested-by'
      ].join(','),
    });
  }

  afterModel(model, transition) {
    const arrayToSearch = model.showAsRemark ? this.modelFor('agenda.agendaitems').announcements : this.modelFor('agenda.agendaitems').notas;
    if (!arrayToSearch.includes(model) && arrayToSearch.length) { // This can happen when the selected item no longer is visible in the sidebar after filtering
      this.transitionTo('agenda.agendaitems.agendaitem', arrayToSearch[0]);
    }
    this.transition = transition; // set on the route for use in setupController, since the provided "transition" argument there always comes back "undefined"
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.meeting = this.modelFor('agenda').meeting;

    const agendaitemsOverviewController = this.controllerFor('agenda.agendaitems');
    agendaitemsOverviewController.selectedAgendaitem = model;
  }
}
