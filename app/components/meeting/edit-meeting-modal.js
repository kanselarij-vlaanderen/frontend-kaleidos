import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task, dropTask } from 'ember-concurrency';
import { A } from '@ember/array';
import moment from 'moment';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { fetchClosestMeetingAndAgendaId } from 'frontend-kaleidos/utils/meeting-utils';

/**
 * @argument {meeting}
 * @argument {didSave}
 * @argument {onCancel}
 */
export default class MeetingEditMeetingComponent extends Component {
  @service store;
  @service newsletterService;
  @service toaster;

  @tracked isAnnexMeeting = false;
  @tracked isEditingFormattedMeetingIdentifier = false;

  @tracked selectedMainMeeting;
  @tracked isFinal;
  @tracked kind;
  @tracked startDate;
  @tracked extraInfo;
  @tracked _meetingNumber;
  @tracked _numberRepresentation;

  constructor() {
    super(...arguments);

    const now = new Date();

    this.meetingYear = this.args.meeting.plannedStart?.getFullYear() || now.getFullYear();
    this.startDate = this.args.meeting.plannedStart || new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0);
    this.extraInfo = this.args.meeting.extraInfo;
    this.numberRepresentation = this.args.meeting.numberRepresentation;
    this.isFinal = this.args.isFinal ?? false;

    this.initializeKind.perform();
    this.initializeMeetingNumber.perform();
    this.initializeMainMeeting.perform();
  }

  get meetingKindPostfix() {
    if (this.kind?.uri === CONSTANTS.MEETING_KINDS.PVV) {
      return 'VV';
    }
    return '';
  }

  get numberRepresentation() {
    return this._numberRepresentation ?? `VR PV ${this.meetingYear}/${this.meetingNumber}`;
  }

  set numberRepresentation(numberRepresentation) {
    this._numberRepresentation = numberRepresentation;
  }

  get meetingNumber() {
    return this._meetingNumber;
  }

  set meetingNumber(meetingNumber) {
    this._meetingNumber = meetingNumber;
    if (meetingNumber) {
      this._numberRepresentation = null;
    }
  }

  get savingIsDisabled() {
    return (
        (this.isAnnexMeeting && !this.selectedMainMeeting) ||
        !this.meetingNumber ||
        !this.numberRepresentation ||
        this.initializeKind.isRunning ||
        this.initializeMainMeeting.isRunning ||
        this.saveMeeting.isRunning
      );
  }

  @task
    *initializeMainMeeting() {
      this.selectedMainMeeting = yield this.args.meeting.mainMeeting;
    }

  @task
  *initializeKind() {
    this.kind = yield this.args.meeting.kind;
    this.kind ??= yield this.store.findRecordByUri('concept', CONSTANTS.MEETING_KINDS.MINISTERRAAD);
    const broader = yield this.kind?.broader;
    this.isAnnexMeeting = broader?.uri === CONSTANTS.MEETING_KINDS.ANNEX;
  }

  @dropTask
  *initializeMeetingNumber() {
    if (this.args.meeting.number) {
      this.meetingNumber = this.args.meeting.number;
    } else {
      const meeting = yield this.store.queryOne('meeting', {
        filter: {
          ':gte:planned-start': new Date(this.meetingYear, 0, 1).toISOString(),
          ':lt:planned-start': new Date(this.meetingYear + 1, 0, 1).toISOString(),
        },
        sort: '-number',
      });

      const id = meeting?.number ?? 0;
      this.meetingNumber = id + 1;
    }
  }

  @dropTask
  *saveMeeting() {
    const isNewMeeting = this.args.meeting.isNew;
    const now = new Date();

    this.args.meeting.extraInfo = this.extraInfo;
    this.args.meeting.plannedStart = this.startDate || now;
    this.args.meeting.kind = this.kind;
    this.args.meeting.number = this.meetingNumber;
    this.args.meeting.numberRepresentation = this.numberRepresentation;
    this.args.meeting.mainMeeting = this.selectedMainMeeting;
    this.args.meeting.isFinal = false;

    try {
      yield this.args.meeting.save();
      if (isNewMeeting) {
        const closestMeeting = yield fetchClosestMeetingAndAgendaId(this.args.meeting.plannedStart);
        const agenda = yield this.createAgenda(this.args.meeting, now);
        if (!this.isAnnexMeeting && closestMeeting) {
          yield this.createAgendaitemToApproveMinutes(
            agenda,
            this.args.meeting,
            closestMeeting
          );
        }
        yield this.newsletterService.createNewsItemForMeeting(this.args.meeting);
        // TODO: Should fix sessionNrBug
        // Import from meeting-utils.js
        // yield assignNewSessionNumbers();
      }
    } catch {
      this.toaster.error();
    } finally {
      yield this.args.didSave();
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
    this.selectedMainMeeting = mainMeeting;
    this.startDate = mainMeeting.plannedStart;
    this.meetingNumber = mainMeeting.number;
    this.formattedMeetingIdentifier = `${mainMeeting.numberRepresentation}-${this.meetingKindPostfix}`;
    this.extraInfo = mainMeeting.extraInfo;
  }

  @action
  selectStartDate(val) {
    this.startDate = val;
  }

  @action
  async setKind(kind) {
    this.kind = kind;

    const broader = await this.kind?.broader;
    this.isAnnexMeeting = broader?.uri === CONSTANTS.MEETING_KINDS.ANNEX;

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
