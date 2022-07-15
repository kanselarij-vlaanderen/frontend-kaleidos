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
  @tracked plannedDocumentReleaseDate;
  @tracked extraInfo;
  @tracked _meetingNumber;
  @tracked _numberRepresentation;

  currentYear = new Date().getFullYear();

  constructor() {
    super(...arguments);
    this.isNew = this.args.meeting.isNew;

    const now = new Date();
    this.meetingYear = this.args.meeting.plannedStart?.getFullYear() || this.currentYear;
    this.startDate = this.args.meeting.plannedStart || new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0);
    this.extraInfo = this.args.meeting.extraInfo;
    this.numberRepresentation = this.args.meeting.numberRepresentation;

    this.initializeKind.perform();
    this.initializeMeetingNumber.perform();
    this.initializeMainMeeting.perform();
    if (!this.args.meeting.isFinal) {
      this.initializePublicationModels.perform();
    }
  }

  get meetingKindPostfix() {
    if (this.selectedKind?.uri === CONSTANTS.MEETING_KINDS.PVV) {
      return 'VV';
    }
    return '';
  }

  get suggestedDocumentReleaseDate() {
    this.startDate; // listen to changes of startDate

    if (this.plannedDocumentReleaseDate !== undefined) {
      return this.plannedDocumentReleaseDate;
    } else {
      return getNextWorkday(this.startDate, 14, 0, 0, 0);
    }
  }

  get minSuggestedPublicationTime() {
    const minTimeMS = Math.max(this.startDate.getTime(), this.now)
    const date = new Date(minTimeMS + AgendaPublicationUtils.PROCESSING_WINDOW_MS);
    date.setMilliseconds(0); // WORKAROUND: Flatpickr does not handle @minDate and milliseconds correctly: sometimes causes flickering when not 0
    return date;
  }

  get errorSuggestedPublicationTime() {
    if (this.suggestedDocumentReleaseDate === null) {
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
        this.errorSuggestedPublicationTime ||
        this.initializeKind.isRunning ||
        this.initializeMainMeeting.isRunning ||
        this.saveMeeting.isRunning
      );
  }

  @action
  setPlannedPublicationDate(newPlannedDocumentReleaseDate) {
    // when clearing VlDatepicker manually, it does not pass undefined or null,
    //  but instead passes the now Date as the new Date
    // the @min however does clear the @date, when it is below @min,
    //  but this does not trigger this action
    // because minSuggestedPublicationTime is always higher than now
    //  it results in a visually cleared datepicker,
    //  but the @tracked plannedDocumentReleaseDate being set
    // this check prevents that confusing case
    if (newPlannedDocumentReleaseDate < this.minSuggestedPublicationTime) {
      this.plannedDocumentReleaseDate = this.minSuggestedPublicationTime;
    } else {
      this.plannedDocumentReleaseDate = newPlannedDocumentReleaseDate;
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

  @task
  *initializePublicationModels() {
    // load the records by fetching the relation, this works for both old and new meetings
    const meeting = this.args.meeting;
    this.internalDecisionPublicationActivity = yield meeting.internalDecisionPublicationActivity;
    this.internalDocumentPublicationActivity = yield meeting.internalDocumentPublicationActivity;
    const themisPublicationActivities = yield meeting.themisPublicationActivities;
    // TODO KAS-3431 possible to get the wrong object when newsletters have been released already and an edit happens here
    // TODO KAS-3431 should we filter on the scope of "documents" here in that case?
    this.themisPublicationActivity = themisPublicationActivities.firstObject;
    if (this.isNew) {
      // load plannedStatus and empty date (to be filled in by getter)
      const plannedStatus = yield this.store.findRecordByUri('release-status', CONSTANTS.RELEASE_STATUSES.PLANNED);
      this.plannedDocumentReleaseDate = undefined;

      // set the status of all to "planned", no status was set on creation
      this.internalDecisionPublicationActivity.status = plannedStatus;
      this.internalDocumentPublicationActivity.status = plannedStatus;
      this.themisPublicationActivity.status = plannedStatus;
    } else {
      // get the planned date from existing data
      // we could get this from either this or themis publication, both should be equal at this point
      this.plannedDocumentReleaseDate = this.internalDocumentPublicationActivity.plannedPublicationTime;
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

    if (!this.args.meeting.isFinal) {
      // update the plannedDate (not needed for decisions)
      this.themisPublicationActivity.plannedPublicationTime = this.plannedDocumentReleaseDate;
      this.internalDocumentPublicationActivity.plannedPublicationTime = this.plannedDocumentReleaseDate;
    }

    try {
      yield this.args.meeting.save();
      if (!this.args.meeting.isFinal) {
        yield this.themisPublicationActivity.save();
        yield this.internalDocumentPublicationActivity.save();
        yield this.internalDecisionPublicationActivity.save();
      }
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
