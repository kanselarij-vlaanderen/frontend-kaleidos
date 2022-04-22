import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import moment from 'moment';
import { A } from '@ember/array';
// TODO: determine if these default qp's are still needed here, otherwise refactor to mixin-less solution
// eslint-disable-next-line ember/no-mixins
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';
import { fetchClosestMeetingAndAgendaId } from 'frontend-kaleidos/utils/meeting-utils';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class AgendasController extends Controller.extend(DefaultQueryParamsMixin) {
  @service store;
  @service currentSession;
  @service router;
  @service newsletterService;

  @tracked newMeeting;
  @tracked isCreatingNewSession = false;

  @action
  openNewSessionModal() {
    this.isCreatingNewSession = true;
  }

  @action
  closeNewSessionModal() {
    this.isCreatingNewSession = false;
    this.newMeeting.deleteRecord();
    this.newMeeting = this.store.createRecord('meeting');
  }

  @action
  async createAgendaAndNewsletter() {
    const agenda = await this.createAgenda(this.newMeeting);

    const closestMeeting = await fetchClosestMeetingAndAgendaId(this.newMeeting.plannedStart);
    const kind = await this.newMeeting.kind;
    const broader = await kind?.broader;
    const isAnnexMeeting = broader?.uri === CONSTANTS.MEETING_KINDS.ANNEX;
    if (!isAnnexMeeting && closestMeeting) {
      await this.createAgendaitemToApproveMinutes(
        agenda,
        this.newMeeting,
        closestMeeting
      );
    }
    await this.newsletterService.createNewsItemForMeeting(this.newMeeting);
    this.newMeeting = this.store.createRecord('meeting');
    // TODO: Should fix sessionNrBug
    // Import from meeting-utils.js
    // await assignNewSessionNumbers();
    this.isCreatingNewSession = false;
    this.send('refreshRoute');
    this.router.transitionTo('agendas.overview');
  }

  async createAgenda(meeting) {
    const now = new Date();
    const status = await this.store.findRecordByUri(
      'agendastatus',
      CONSTANTS.AGENDA_STATUSSES.DESIGN
    );
    const agenda = this.store.createRecord('agenda', {
      serialnumber: 'A',
      title: `Agenda A voor zitting ${moment(meeting.plannedStart).format(
        'D-M-YYYY'
      )}`,
      createdFor: meeting,
      status,
      created: now,
      modified: now,
    });
    await agenda.save();
    return agenda;
  }

  async createAgendaitemToApproveMinutes(agenda, newMeeting, closestMeeting) {
    const now = new Date();

    const decisionResultCode = await this.store.findRecordByUri(
      'decision-result-code',
      CONSTANTS.DECISION_RESULT_CODE_URIS.GOEDGEKEURD
    );

    const startDate = newMeeting.plannedStart;
    const agendaItemTreatment = this.store.createRecord(
      'agenda-item-treatment',
      {
        created: now,
        modified: now,
        startDate: startDate,
        decisionResultCode,
      }
    );
    await agendaItemTreatment.save();

    const agendaitem = this.store.createRecord('agendaitem', {
      created: now,
      agenda,
      number: 1,
      shortTitle: `Goedkeuring van het verslag van de vergadering van ${moment(
        closestMeeting.plannedstart
      ).format('dddd DD-MM-YYYY')}.`,
      formallyOk: CONSTANTS.ACCEPTANCE_STATUSSES.NOT_YET_OK,
      isApproval: true,
      treatments: A([agendaItemTreatment]),
    });
    await agendaitem.save();
    return agendaitem;
  }
}
