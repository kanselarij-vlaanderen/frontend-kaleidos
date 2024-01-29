import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { startOfDay } from 'date-fns';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';

export default class AgendaMinutesRoute extends Route {
  @service router;
  @service store;
  @service mandatees;
  @service signatureService;

  async getMandatees() {
    const { meeting } = this.modelFor('agenda');
    const currentMandatees = await this.mandatees.getMandateesActiveOn.perform(
      startOfDay(meeting.plannedStart),
      null,
      null,
      [
        CONSTANTS.MANDATE_ROLES.MINISTER_PRESIDENT,
        CONSTANTS.MANDATE_ROLES.VICEMINISTER_PRESIDENT,
        CONSTANTS.MANDATE_ROLES.MINISTER,
      ]
    );

    return [...new Set(currentMandatees)];
  }

  async model() {
    const { agenda, meeting } = this.modelFor('agenda');

    const mandatees = await this.getMandatees();
    const notas = [];
    const announcements = [];

    // Could be optimized not to make below query again when only query params changed
    // *NOTE* Do not change this query, this call is pre-cached by cache-warmup-service
    const agendaitems = await this.store.query('agendaitem', {
      'filter[agenda][:id:]': agenda.id,
      include: 'type',
      'page[size]': PAGE_SIZE.AGENDAITEMS,
      sort: 'type.position,number',
    });
    for (const agendaitem of agendaitems.toArray()) {
      const type = await agendaitem.type;
      if (type?.uri === CONSTANTS.AGENDA_ITEM_TYPES.ANNOUNCEMENT) {
        announcements.push(agendaitem);
      } else {
        notas.push(agendaitem);
      }
    }
    const minutes = await meeting.minutes;
    return { minutes, mandatees, notas, announcements, meeting, agenda };
  }

  async afterModel(model, _transition) {
    const meeting = model.meeting;
    const agenda = model.agenda;
    if (meeting?.isPreDigitalMinutes) {
      this.router.transitionTo('agenda.agendaitems', meeting.id, agenda.id);
    }
  }

  async setupController(controller) {
    super.setupController(...arguments);
    controller.isLoading = true;
    const meeting = this.modelFor('agenda').meeting;
    controller.meeting = meeting;
    const agenda = this.modelFor('agenda').agenda;
    controller.agenda = agenda;
    controller.isEditing = false;
    controller.isFullscreen = false;
    controller.editor = null;
    const minutes = await meeting.minutes;
    if (minutes) {
      controller.hasSignFlow = await this.signatureService.hasSignFlow(minutes);
      controller.hasMarkedSignFlow = await this.signatureService.hasMarkedSignFlow(minutes);
    }
    controller.isLoading = false;
  }
}
