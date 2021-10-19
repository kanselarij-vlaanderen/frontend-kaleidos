import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AgendaitemAgendaitemsAgendaRoute extends Route {
  @service sessionService;

  model(params) {
    return this.store.findRecord('agendaitem', params.agendaitem_id, {
      include: 'agenda-activity,agenda-activity.subcase,agenda-activity.subcase.requested-by',
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
    const {
      meeting,
      agenda,
    } = this.modelFor('agenda');
    const {
      notas,
      announcements,
      newItems,
    } = this.modelFor('agenda.agendaitems');
    controller.meeting = meeting;
    controller.agenda = agenda;
    controller.notas = notas;
    /* reasoning for this check:
      Currently, the grouping on mandatees is done in agenda.agendaitems.index controller (overview)
      Because of that, the nota groups don't update in the agenda.agendaitem.agendaitem controller (this sibling route) unless we manually trigger it
      We don't want the nota groups to be rebuild everytime we select a different agendaitem (1st check in the IF)
      However, when we refresh this route as part of parent model refresh, we get the same transition but we do want to rebuild the groups
      In those cases, the 2d part of the IF (queryParamsOnly) will be true.
      Switching between agendaitems in detail view has queryParamsOnly false
      A better solution could be to build the nota groups in the agenda.agendaitems controller and pass the groups down to both child routes
    */
    if (!(this.transition?.from?.name.startsWith('agenda.agendaitems.agendaitem') && !(this.transition?.queryParamsOnly))) {
      controller.groupNotasOnGroupName.perform(notas);
    }
    controller.announcements = announcements;
    controller.newItems = newItems;
  }
}
