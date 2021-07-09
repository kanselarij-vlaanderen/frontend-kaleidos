import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AgendaitemAgendaitemsAgendaRoute extends Route {
  @service sessionService;

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
    if (!(this.transition && this.transition.from && this.transition.from.name.startsWith('agenda.agendaitems.agendaitem'))) {
      controller.groupNotasOnGroupName.perform(notas);
    }
    controller.announcements = announcements;
    controller.newItems = newItems;
  }
}
