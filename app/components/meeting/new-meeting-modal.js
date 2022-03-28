import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import moment from 'moment';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import {
  fetchClosestMeetingAndAgendaId,
} from 'frontend-kaleidos/utils/meeting-utils';

/**
 * @argument {didSave}
 * @argument {onCancel}
 */
export default class MeetingNewMeetingModal extends Component {
  @service store;
  @service newsletterService;
  @service toaster;

  @tracked kind = null;
  @tracked selectedMainMeeting = null;
  @tracked isEditingFormattedMeetingIdentifier = false;
  @tracked _meetingNumber = null;
  @tracked _formattedMeetingIdentifier = null;

  currentYear = new Date().getFullYear();

  constructor() {
    super(...arguments);

    this.initializeMeetingNumber.perform();
  }

  get isAnnexMeeting() {
    return this.kind?.get('isAnnexMeeting');
  }

  get formattedMeetingIdentifier() {
    if (!this._formattedMeetingIdentifier) {
      return `VR PV ${this.currentYear}/${this.meetingNumber}`;
    }
    return this._formattedMeetingIdentifier;
  }

  set formattedMeetingIdentifier(formattedMeetingIdentifier) {
    this._formattedMeetingIdentifier = formattedMeetingIdentifier;
  }

  get meetingNumber() {
    return this._meetingNumber;
  }

  set meetingNumber(meetingNumber) {
    this._meetingNumber = meetingNumber;
    this._formattedMeetingIdentifier = null;
  }

  @dropTask
  *initializeMeetingNumber() {
    const meeting = yield this.store.queryOne('meeting', {
      filter: {
        ':gte:planned-start': new Date(
          Date.UTC(this.currentYear, 0, 1)
        ).toISOString(),
        ':lt:planned-start': new Date(
          Date.UTC(this.currentYear + 1, 0, 1)
        ).toISOString(),
      },
      sort: '-number',
    });

    const id = meeting?.number ?? 0;
    this.meetingNumber = id + 1;
  }

  @dropTask
  *createMeeting() {
    const now = new Date();
    const startDate = this.startDate || now;
    const meeting = this.store.createRecord('meeting', {
      extraInfo: this.extraInfo,
      isFinal: false,
      plannedStart: startDate,
      kind: this.kind,
      mainMeeting: this.selectedMainMeeting,
      number: this.meetingNumber,
      numberRepresentation: this.formattedMeetingIdentifier,
    });

    const closestMeeting = yield fetchClosestMeetingAndAgendaId(startDate);

    try {
      yield meeting.save();
      const agenda = yield this.createAgenda(meeting, now);
      if (!meeting.isAnnex && closestMeeting) {
        yield this.createAgendaitemToApproveMinutes(
          agenda,
          meeting,
          closestMeeting
        );
      }
      yield this.newsletterService.createNewsItemForMeeting(meeting);
      // TODO: Should fix sessionNrBug
      // Import from meeting-utils.js
      // yield assignNewSessionNumbers();
    } catch (err) {
      this.toaster.error();
    } finally {
      this.args.didSave();
    }
  }

  async createAgenda(meeting, date) {
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
      created: date,
      modified: date,
    });
    await agenda.save();
    return agenda;
  }

  // new meeting parameter prevents extra request of agenda.createdFor
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

  @action
  selectMainMeeting(mainMeeting) {
    const postfix = this.kind?.postfix || '';
    this.selectedMainMeeting = mainMeeting;
    this.startDate = mainMeeting.plannedStart;
    this.meetingNumber = mainMeeting.number;
    this.formattedMeetingIdentifier = `${mainMeeting.numberRepresentation}-${postfix}`;
    this.extraInfo = mainMeeting.extraInfo;
  }

  @action
  selectStartDate(val) {
    this.startDate = val;
  }

  @action
  async setKind(kind) {
    this.kind = kind;
    if (!this.isAnnexMeeting) {
      this.selectedMainMeeting = null;
      this.initializeMeetingNumber.perform();
    }
  }

  @action
  toggleEditingFormattedMeetingIdentifier() {
    this.isEditingFormattedMeetingIdentifier =
      !this.isEditingFormattedMeetingIdentifier;
  }
}
