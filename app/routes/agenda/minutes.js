import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { startOfDay } from 'date-fns';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';

export default class AgendaMinutesRoute extends Route {
  @service store;
  @service mandatees;

  async getMandatees() {
    const currentMandatees = await this.mandatees.getMandateesActiveOn.perform(
      startOfDay(new Date()),
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
    const meetingMinutes = await meeting.minutes;
    return { minutes: meetingMinutes, mandatees, notas, announcements };
  }

  setupController(controller) {
    super.setupController(...arguments);
    const meeting = this.modelFor('agenda').meeting;
    controller.meeting = meeting;
    const agenda = this.modelFor('agenda').agenda;
    controller.agenda = agenda;
    controller.editor = null;
    controller.isEditing = false;
    controller.isFullscreen = false;
    controller.editor = null;
  }
}
