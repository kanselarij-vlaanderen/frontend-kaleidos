import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';

/**
 * @argument {meeting}
 * @argument {didSave}
 * @argument {onCancel}
 */
export default class MeetingEditMeetingComponent extends Component {
  @service toaster;

  @tracked kind;
  @tracked startDate;
  @tracked extraInfo;
  @tracked _meetingNumber;
  @tracked _numberRepresentation;

  constructor() {
    super(...arguments);

    this.initializeKind.perform();

    this.meetingYear = this.args.meeting.plannedStart.getFullYear();
    this.startDate = this.args.meeting.plannedStart;
    this.extraInfo = this.args.meeting.extraInfo;
    this.meetingNumber = this.args.meeting.number;
    this.numberRepresentation = this.args.meeting.numberRepresentation;
  }

  get numberRepresentation() {
    if (!this._numberRepresentation) {
      return `VR PV ${this.meetingYear}/${this.meetingNumber}`;
    }
    return this._numberRepresentation;
  }

  set numberRepresentation(numberRepresentation) {
    this._numberRepresentation = numberRepresentation;
  }

  get meetingNumber() {
    return this._meetingNumber;
  }

  set meetingNumber(meetingNumber) {
    this._meetingNumber = meetingNumber;
    this._numberRepresentation = null;
  }

  @task
  *initializeKind() {
    this.kind = yield this.args.meeting.kind;
  }

  @task({ drop: true })
  *updateMeeting() {
    const now = new Date();

    this.args.meeting.extraInfo = this.extraInfo;
    this.args.meeting.plannedStart = this.startDate || now;
    this.args.meeting.kind = this.kind;
    this.args.meeting.number = this.meetingNumber;
    this.args.meeting.numberRepresentation = this.numberRepresentation;

    try {
      yield this.args.meeting.save();
    } catch {
      this.toaster.error();
    } finally {
      this.args.didSave();
    }
  }

  @action
  selectStartDate(val) {
    this.startDate = val;
  }

  @action
  setKind(kind) {
    this.kind = kind;
  }
}
