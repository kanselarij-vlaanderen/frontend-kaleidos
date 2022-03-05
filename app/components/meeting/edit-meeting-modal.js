import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import EmberObject from '@ember/object';
import { A } from '@ember/array';
import CONFIG from 'frontend-kaleidos/utils/config';

/**
 * @argument {meeting}
 * @argument {didSave}
 * @argument {onCancel}
 */
export default class MeetingEditMeetingComponent extends Component {
  @service toaster;

  @tracked kind;
  @tracked selectedKindUri;
  @tracked startDate;
  @tracked extraInfo;
  @tracked _meetingNumber;
  @tracked _numberRepresentation;

  meetingYear = this.meeting.plannedStart.getFullYear();

  constructor() {
    super(...arguments);

    this.selectedKindUri = this.meeting.kind;
    this.kind = EmberObject.create(
      CONFIG.MINISTERRAAD_TYPES.TYPES.find(
        (minsterraad) => minsterraad.uri === this.selectedKindUri
      )
    );
    this.startDate = this.meeting.plannedStart;
    this.extraInfo = this.meeting.extraInfo;
    this.meetingNumber = this.meeting.number;
    this.numberRepresentation = this.meeting.numberRepresentation;
  }

  get date() {
    return A([this.startDate]);
  }

  get meeting() {
    return this.args.meeting;
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

  @task({ drop: true })
  *updateMeeting() {
    const now = new Date();

    this.meeting.extraInfo = this.extraInfo;
    this.meeting.plannedStart = this.startDate || now;
    this.meeting.created = now;
    this.meeting.kind = this.selectedKindUri;
    this.meeting.number = this.meetingNumber;
    this.meeting.numberRepresentation = this.numberRepresentation;

    try {
      yield this.meeting.save();
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
    this.selectedKindUri = kind;
  }
}
