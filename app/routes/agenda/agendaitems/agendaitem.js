import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';
import CONSTANTS from 'frontend-kaleidos/config/constants';

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
    const type = await model.type;
    const arrayToSearch = (type.uri === CONSTANTS.AGENDA_ITEM_TYPES.ANNOUNCEMENT) ? this.modelFor('agenda.agendaitems').announcements : this.modelFor('agenda.agendaitems').notas;
    if (!arrayToSearch.includes(model) && arrayToSearch.length) { // This can happen when the selected item no longer is visible in the sidebar after filtering
      this.transitionTo('agenda.agendaitems.agendaitem', arrayToSearch[0]);
    }
    this.transition = transition; // set on the route for use in setupController, since the provided "transition" argument there always comes back "undefined"

    const agendaItemTreatment = await model.treatment;
    this.newsletterInfo = await agendaItemTreatment?.newsletterInfo;
    this.decisionActivity = await agendaItemTreatment?.decisionActivity;
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.meeting = this.modelFor('agenda').meeting;
    controller.decisionsExist = isPresent(this.decisionActivity);
    controller.newsItemExists = isPresent(this.newsletterInfo);
    controller.pressAgendaitemExists = isPresent(model.titlePress && model.textPress);

    // eslint-disable-next-line ember/no-controller-access-in-routes
    const parentController = this.controllerFor('agenda.agendaitems');
    parentController.selectedAgendaitem = model;
  }
}
