import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { assert } from '@ember/debug';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import EmberObject from '@ember/object';
import { A } from '@ember/array';
import moment from 'moment';
import CONFIG from 'frontend-kaleidos/utils/config';

export default class MeetingEditMeetingComponent extends Component {
  @service store;
  @service agendaService;
  @service toaster;
  @service formatter;

  @tracked kind;
  @tracked selectedKindUri;
  @tracked startDate;
  @tracked extraInfo;
  @tracked meetingNumber;
  @tracked numberRepresentation;

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
    assert(
      `'meeting' is required and must be an object`,
      this.args.meeting !== undefined && typeof this.args.meeting === 'object'
    );

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

  @action
  meetingNumberChangedAction(event) {
    const meetingNumber = event.target.value;
    const meetingYear = moment(this.meeting.plannedStart).year();
    this.meetingNumber = meetingNumber;
    this.formattedMeetingIdentifier = `VR PV ${meetingYear}/${meetingNumber}`;
    this.numberRepresentation = this.formattedMeetingIdentifier;
  }

  @task({ drop: true })
  *updateSession() {
    const {
      isDigital,
      extraInfo,
      selectedKindUri,
      meeting,
      meetingNumber,
      numberRepresentation,
    } = this;
    const kindUriToAdd = selectedKindUri || CONFIG.MINISTERRAAD_TYPES.DEFAULT;
    const date = this.formatter.formatDate(null);
    const startDate = this.startDate || date;

    yield meeting.set('isDigital', isDigital);
    yield meeting.set('extraInfo', extraInfo);
    yield meeting.set('plannedStart', startDate);
    yield meeting.set('created', date);
    yield meeting.set('kind', kindUriToAdd);
    yield meeting.set('number', meetingNumber);
    yield meeting.set('numberRepresentation', numberRepresentation);

    try {
      yield meeting.save();
    } catch {
      this.toaster.error();
    } finally {
      this.args.didSave();
    }
  }

  @action
  selectStartDate(val) {
    this.startDate = this.formatter.formatDate(val);
  }

  @action
  setKind(kind) {
    this.selectedKindUri = kind;
  }
}
