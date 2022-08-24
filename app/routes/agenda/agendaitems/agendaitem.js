import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AgendaitemAgendaitemsAgendaRoute extends Route {
  @service store;

  model(params) {
    return this.store.findRecord('agendaitem', params.agendaitem_id, {
      include: [
        'agenda-activity',
        'agenda-activity.subcase',
        'agenda-activity.subcase.requested-by'
      ].join(','),
    });
  }

  async afterModel(model, transition) {
    const arrayToSearch = model.showAsRemark ? this.modelFor('agenda.agendaitems').announcements : this.modelFor('agenda.agendaitems').notas;
    if (!arrayToSearch.includes(model) && arrayToSearch.length) { // This can happen when the selected item no longer is visible in the sidebar after filtering
      this.transitionTo('agenda.agendaitems.agendaitem', arrayToSearch[0]);
    }
    this.transition = transition; // set on the route for use in setupController, since the provided "transition" argument there always comes back "undefined"

    this.treatment = await model.treatment;
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.meeting = this.modelFor('agenda').meeting;
    controller.treatment = this.treatment;

    // eslint-disable-next-line ember/no-controller-access-in-routes
    const parentController = this.controllerFor('agenda.agendaitems');
    parentController.selectedAgendaitem = model;
  }
}
