import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task, dropTask } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { getNextWorkday } from 'frontend-kaleidos/utils/date-util';

/**
 * @argument {isNew}
 * @argument {meeting}
 * @argument {didSave}
 * @argument {onCancel}
 */
export default class MeetingEditMeetingComponent extends Component {
  @service store;
  @service toaster;

  @tracked isAnnexMeeting = false;
  @tracked isEditingNumberRepresentation = false;
  @tracked isNew = false;

  @tracked selectedKind;
  @tracked selectedMainMeeting;
  @tracked startDate;
  // In order to adapt default value to the selected startDate, we distinguish not specified and cleared
  //  When not not specified -> _plannedPublicationDate === undefined
  //  When cleared -> _plannedPublicationDate === null
  @tracked _plannedPublicationDate; // planned date of release of documents and publication to Themis (meeting.internalDocumentPublicationActivity.plannedStart and meeting.themisPublicationActivity.plannedStart)
  @tracked extraInfo;
  @tracked _meetingNumber;
  @tracked _numberRepresentation;

  currentYear = new Date().getFullYear();

  constructor() {
    super(...arguments);
    this.isNew = this.args.meeting.isNew;

    this.initFields.perform();
    this.initializeKind.perform();
    this.initializeMeetingNumber.perform();
    this.initializeMainMeeting.perform();
  }

  @task
  *initFields() {
    const now = new Date();

    this.meetingYear = this.args.meeting.plannedStart?.getFullYear() || this.currentYear;
    this.startDate = this.args.meeting.plannedStart || new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0);
    this.extraInfo = this.args.meeting.extraInfo;
    this.numberRepresentation = this.args.meeting.numberRepresentation;

    if (this.isNew) {
      const meeting = this.args.meeting;
      this._plannedPublicationDate = undefined;
      this.internalDecisionPublicationActivity = yield meeting.internalDecisionPublicationActivity;
      this.internalDocumentPublicationActivity = yield meeting.internalDocumentPublicationActivity;
      const themisPublicationActivities = yield meeting.themisPublicationActivities;
      this.themisPublicationActivity = themisPublicationActivities.firstObject;
    }
  }

  get meetingKindPostfix() {
    if (this.selectedKind?.uri === CONSTANTS.MEETING_KINDS.PVV) {
      return 'VV';
    }
    return '';
  }

  /** if user did not set plannedPublicationDate: display next workday after meeting */
  get plannedPublicationDate() {
    this.startDate; // listen to changes of startDate

    if (this._plannedPublicationDate !== undefined) {
      return this._plannedPublicationDate;
    } else {
      // eslint-disable-next-line prettier/prettier
      const plannedPublicationDate = getNextWorkday(this.startDate, 14, 0, 0, 0);
      return plannedPublicationDate;
    }
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

  setPlannedPublicationDate(date) {
    // set to null when cleared: in order to distinguish from untouched state.
    this._plannedPublicationDate = date ? date : null;
  }

  @task
  *initializeMainMeeting() {
    this.selectedMainMeeting = yield this.args.meeting.mainMeeting;
  }

  @task
  *initializeKind() {
    this.selectedKind = yield this.args.meeting.kind;
    this.selectedKind ??= yield this.store.findRecordByUri('concept', CONSTANTS.MEETING_KINDS.MINISTERRAAD);
    const broader = yield this.selectedKind?.broader;
    this.isAnnexMeeting = broader?.uri === CONSTANTS.MEETING_KINDS.ANNEX;
  }

  @dropTask
  *initializeMeetingNumber() {
    if (this.args.meeting.number) {
      this.meetingNumber = this.args.meeting.number;
    } else {
      const meeting = yield this.store.queryOne('meeting', {
        filter: {
          ':gte:planned-start': new Date(this.currentYear, 0, 1).toISOString(),
          ':lt:planned-start': new Date(this.currentYear + 1, 0, 1).toISOString(),
        },
        sort: '-number',
      });

      const id = meeting?.number ?? 0;
      this.meetingNumber = id + 1;
    }
  }

  @dropTask
  *saveMeeting() {
    const now = new Date();

    this.args.meeting.extraInfo = this.extraInfo;
    this.args.meeting.plannedStart = this.startDate || now;
    this.args.meeting.kind = this.selectedKind;
    this.args.meeting.number = this.meetingNumber;
    this.args.meeting.numberRepresentation = this.numberRepresentation;
    this.args.meeting.mainMeeting = this.selectedMainMeeting;

    if (this.isNew) {
      this.themisPublicationActivity.plannedStart = this.plannedPublicationDate;
      this.internalDocumentPublicationActivity.plannedStart = this.plannedPublicationDate;
    }

    try {
      yield this.args.meeting.save();
    } catch (err) {
      console.error(err);
      this.toaster.error();
    } finally {
      // TOASK: Is this correct?
      yield this.args.didSave();
    }
  }

  filterMainMeetingResults(meeting, results) {
    return results.filter((result) => result.id != meeting.id);
  }

  @action
  selectMainMeeting(mainMeeting) {
    this.selectedMainMeeting = mainMeeting;
    this.startDate = mainMeeting.plannedStart;
    this.meetingNumber = mainMeeting.number;
    this.numberRepresentation = `${mainMeeting.numberRepresentation}-${this.meetingKindPostfix}`;
    this.extraInfo = mainMeeting.extraInfo;
  }

  @action
  async selectKind(kind) {
    this.selectedKind = kind;

    const broader = await this.selectedKind?.broader;
    this.isAnnexMeeting = broader?.uri === CONSTANTS.MEETING_KINDS.ANNEX;

    if (!this.isAnnexMeeting) {
      this.selectedMainMeeting = null;
      this.initializeMeetingNumber.perform();
    }
  }

  @action
  toggleEditingNumberRepresentation() {
    this.isEditingNumberRepresentation =
      !this.isEditingNumberRepresentation;
  }
}
