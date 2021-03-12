import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AgendaitemAgendaitemsAgendaRoute extends Route {
  @service sessionService;

  model(params) {
    return this.store.findRecord('agendaitem', params.agendaitem_id, {
      include: 'agenda-activity,agenda-activity.subcase',
    });
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
    } = this.modelFor('agenda.agendaitems');
    controller.meeting = meeting;
    controller.agenda = agenda;
    controller.notas = notas;
    controller.announcements = announcements;
  }
}
