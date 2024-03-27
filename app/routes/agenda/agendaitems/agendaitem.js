import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class AgendaitemAgendaitemsAgendaRoute extends Route {
  @service router;
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
    const type = await model.type;
    const arrayToSearch = (type.uri === CONSTANTS.AGENDA_ITEM_TYPES.ANNOUNCEMENT) ? this.modelFor('agenda.agendaitems').announcements : this.modelFor('agenda.agendaitems').notas;
    if (!arrayToSearch.includes(model) && arrayToSearch.length) { // This can happen when the selected item no longer is visible in the sidebar after filtering
      this.router.transitionTo('agenda.agendaitems.agendaitem', arrayToSearch[0]);
    }
    this.transition = transition; // set on the route for use in setupController, since the provided "transition" argument there always comes back "undefined"

    this.treatment = await model.treatment;
    this.agendaActivity = await model.agendaActivity;
    this.subcase = await this.agendaActivity?.subcase;
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.meeting = this.modelFor('agenda').meeting;
    controller.treatment = this.treatment;
    controller.subcase = this.subcase;

    // eslint-disable-next-line ember/no-controller-access-in-routes
    const parentController = this.controllerFor('agenda.agendaitems');
    parentController.selectedAgendaitem = model;
  }
}
