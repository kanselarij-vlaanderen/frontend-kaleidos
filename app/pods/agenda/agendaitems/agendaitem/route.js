import Route from '@ember/routing/route';

export default class AgendaitemAgendaitemsAgendaRoute extends Route {
  model(params) {
    console.log("model hook pods/agenda/agendaitems/agendaitem");
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

  setupController(controller) {
    super.setupController(...arguments);
    console.log("setup controller hook pods/agenda/agendaitems/agendaitem");
    controller.meeting = this.modelFor('agenda').meeting;

    // TODO KAS-2777 this is no longer allowed
    // ember/no-controller-access-in-routes
    // const parentController = this.controllerFor('agenda.agendaitems');
    // parentController.selectedAgendaitem = model;
  }
}
