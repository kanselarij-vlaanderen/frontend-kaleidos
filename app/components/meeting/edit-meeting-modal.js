import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task, dropTask } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { getNextWorkday } from 'frontend-kaleidos/utils/date-util';
import * as AgendaPublicationUtils from 'frontend-kaleidos/utils/agenda-publication';

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
  //  not specified -> userInputUnconfirmedPublicationTime === undefined
  //  cleared -> userInputUnconfirmedPublicationTime === null
  // planned date of release of documents and publication to Themis (internalDocumentPublicationActivity.unconfirmedPublicationTime and themisPublicationActivity.unconfirmedPublicationTime)
  //  as inputted by user
  @tracked userInputUnconfirmedPublicationTime;
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
    this.now = now;

    this.meetingYear = this.args.meeting.plannedStart?.getFullYear() || this.currentYear;
    this.startDate = this.args.meeting.plannedStart || new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0);
    this.extraInfo = this.args.meeting.extraInfo;
    this.numberRepresentation = this.args.meeting.numberRepresentation;

    if (this.isNew) {
      const meeting = this.args.meeting;
      this.userInputUnconfirmedPublicationTime = undefined;
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

  /** if user did not set unconfirmedPublicationTime: display next workday after meeting */
  get unconfirmedPublicationTime() {
    this.startDate; // listen to changes of startDate

    if (this.userInputUnconfirmedPublicationTime !== undefined) {
      return this.userInputUnconfirmedPublicationTime;
    } else {
      return getNextWorkday(this.startDate, 14, 0, 0, 0);
    }
  }

  get minUnconfirmedPublicationTime() {
    const minTimeMS = Math.max(this.startDate.getTime(), this.now)
    const date = new Date(minTimeMS + AgendaPublicationUtils.PROCESSING_WINDOW_MS);
    date.setMilliseconds(0); // WORKAROUND: Flatpickr does not handle @minDate and milliseconds correctly: sometimes causes flickering when not 0
    return date;
  }

  get errorUnconfirmedPublicationTime() {
    if (this.unconfirmedPublicationTime === null) {
      return 'no-date';
    }
    return null;
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
        this.errorUnconfirmedPublicationTime ||
        this.initializeKind.isRunning ||
        this.initializeMainMeeting.isRunning ||
        this.saveMeeting.isRunning
      );
  }

  @action
  setUnconfirmedPublicationTime(newUnconfirmedPublicationTime) {
    // when clearing VlDatepicker manually, it does not pass undefined or null,
    //  but instead passes the now Date as the new Date
    // the @min however does clear the @date, when it is below @min,
    //  but this does not trigger this action
    // because minUnconfirmedPublicationTime is always higher than now
    //  it results in a visually cleared datepicker,
    //  but the @tracked userUnconfirmedPublicationTime being set
    // this check prevents that confusing case
    if (newUnconfirmedPublicationTime < this.minUnconfirmedPublicationTime) {
      this.userInputUnconfirmedPublicationTime = null;
    } else {
      this.userInputUnconfirmedPublicationTime = newUnconfirmedPublicationTime;
    }
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

    // TODO KAS-3431 status?
    if (this.isNew) {
      // this.themisPublicationActivity.unconfirmedPublicationTime = this.unconfirmedPublicationTime;
      // this.internalDocumentPublicationActivity.unconfirmedPublicationTime = this.unconfirmedPublicationTime;
    }

    try {
      yield this.args.meeting.save();
    } catch (err) {
      console.error(err);
      this.toaster.error();
    } finally {
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
