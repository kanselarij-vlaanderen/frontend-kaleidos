import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { assert } from '@ember/debug';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import moment from 'moment';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import CONFIG from 'frontend-kaleidos/utils/config';
import { isAnnexMeetingKind } from 'frontend-kaleidos/utils/meeting-utils';

export default class MeetingNewMeetingModal extends Component {
  @service store;
  @service agendaService;
  @service newsletterService;
  @service toaster;
  @service formatter;

  @tracked kind = null;
  @tracked selectedMainMeeting = null;
  @tracked selectedKindUri = null;
  @tracked meetingNumber = null;
  @tracked isEditingFormattedMeetingIdentifier = false;
  @tracked formattedMeetingIdentifier = null;

  currentYear = new Date().getFullYear();

  constructor() {
    super(...arguments);

    assert(
      `'didSave' argument is required and must be a function`,
      this.args.didSave !== undefined && typeof this.args.didSave === 'function'
    );
    assert(
      `'onCancel' is required and must be a function`,
      this.args.onCancel !== undefined &&
        typeof this.args.onCancel === 'function'
    );

    this.generateNewNumber();
  }

  get isAnnexMeeting() {
    return isAnnexMeetingKind(this.selectedKindUri);
  }

  async generateNewNumber() {
    // TODO: Improve samen met Michael of Sven
    const meetings = await this.store.query('meeting', {
      sort: '-planned-start',
    });

    if (meetings.length) {
      const meetingsFromThisYear = meetings.filter(
        (meeting) =>
          meeting.plannedStart &&
          meeting.plannedStart.getFullYear() === this.currentYear
      );
      const meetingIds = meetingsFromThisYear
        .map((meeting) => meeting.number)
        .filter((meetingId) => meetingId !== undefined);
      let id = 0;
      // FIX voor de eerste agenda van het jaar -> Anders math.max infinity
      if (meetingIds.length !== 0) {
        id = Math.max(...meetingIds);
      }
      this.meetingNumber = id + 1;
      this.formattedMeetingIdentifier = `VR PV ${this.currentYear}/${this.meetingNumber}`;
    }
  }

  async createAgenda(meeting, date) {
    const status = await this.store.findRecordByUri(
      'agendastatus',
      CONSTANTS.AGENDA_STATUSSES.DESIGN
    );
    const fallBackDate = this.formatter.formatDate(null);
    const agenda = this.store.createRecord('agenda', {
      serialnumber: 'A',
      title: `Agenda A voor zitting ${moment(meeting.plannedStart).format(
        'D-M-YYYY'
      )}`,
      createdFor: meeting,
      status,
      created: date || fallBackDate,
      modified: date || fallBackDate,
    });
    const savedAgenda = await agenda.save();
    return savedAgenda;
  }

  // new meeting parameter prevents extra request of agenda.createdFor
  async createAgendaitemToApproveMinutes(agenda, newMeeting, closestMeeting) {
    const now = new Date();

    // load code-list item
    const decisionResultCode = await this.store.findRecordByUri(
      'decision-result-code',
      CONSTANTS.DECISION_RESULT_CODE_URIS.GOEDGEKEURD
    );

    // Treatment of agenda-item / decision activity
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
      mandatees: [],
      pieces: [],
      approvals: [],
      isApproval: true,
      treatments: A([agendaItemTreatment]),
    });
    return await agendaitem.save();
  }

  @task({ drop: true })
  *createNewSession() {
    const {
      isDigital,
      extraInfo,
      selectedKindUri,
      meetingNumber,
      formattedMeetingIdentifier,
    } = this;
    const kindUriToAdd = selectedKindUri || CONFIG.MINISTERRAAD_TYPES.DEFAULT;
    const date = this.formatter.formatDate(null);
    const startDate = this.startDate || date;
    const newMeeting = this.store.createRecord('meeting', {
      isDigital,
      extraInfo,
      isFinal: false,
      plannedStart: startDate,
      created: date,
      kind: kindUriToAdd,
      mainMeeting: this.selectedMainMeeting,
      number: meetingNumber,
      numberRepresentation: formattedMeetingIdentifier,
    });

    const closestMeeting =
      yield this.agendaService.getClosestMeetingAndAgendaId(startDate);

    try {
      yield newMeeting.save();
      const agenda = yield this.createAgenda(newMeeting, date);
      if (!newMeeting.isAnnex && closestMeeting) {
        yield this.createAgendaitemToApproveMinutes(
          agenda,
          newMeeting,
          closestMeeting
        );
      }
      yield this.newsletterService.createNewsItemForMeeting(newMeeting);
      // TODO: Should fix sessionNrBug
      // await this.agendaService.assignNewSessionNumbers();
    } catch (err) {
      this.toaster.error();
    } finally {
      this.args.didSave(newMeeting);
    }
  }

  @action
  selectMainMeeting(mainMeeting) {
    const kind = CONFIG.MINISTERRAAD_TYPES.TYPES.find(
      (minsterraad) => minsterraad.uri === this.selectedKindUri
    );
    const postfix = (kind && kind.postfix) || '';
    this.selectedMainMeeting = mainMeeting;
    this.startDate = mainMeeting.plannedStart;
    this.meetingNumber = mainMeeting.number;
    this.formattedMeetingIdentifier = `${mainMeeting.numberRepresentation}-${postfix}`;
    this.extraInfo = mainMeeting.extraInfo;
  }

  @action
  selectStartDate(val) {
    this.startDate = this.formatter.formatDate(val);
  }

  @action
  setKind(kind) {
    this.selectedKindUri = kind;
    if (!this.isAnnexMeeting) {
      this.selectedMainMeeting = null;
      this.generateNewNumber();
    }
  }

  @action
  meetingNumberChangedAction(meetingNumber) {
    this.meetingNumber = meetingNumber;
    this.formattedMeetingIdentifier = `VR PV ${this.currentYear}/${meetingNumber}`;
  }

  @action
  editFormattedMeetingIdentifier() {
    this.isEditingFormattedMeetingIdentifier = true;
  }

  @action
  saveAction() {
    this.formattedMeetingIdentifier = `${this.formattedMeetingIdentifier}`;
    this.isEditingFormattedMeetingIdentifier = false;
  }
}
