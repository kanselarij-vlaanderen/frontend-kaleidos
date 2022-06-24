
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import * as AgendaPublicationUtils from 'frontend-kaleidos/utils/agenda-publication';

/**
 * Planned agenda related publications:
 * - InternalDocumentPublicationActivity
 * - ThemisPublicationActivity: only planned publication
 */
export default class AgendaPublicationPlanModal extends Component {
  @service store;

  @tracked internalDocumentPublicationActivity;
  @tracked themisPublicationActivity;
  @tracked internalDocumentPublicationDate;
  @tracked themisPublicationDate;

  constructor() {
    super(...arguments);
    this.initFields.perform();
  }

  @task
  *initFields() {
    this.minPublicationDate = new Date(Date.now() + AgendaPublicationUtils.PROCESSING_WINDOW_MS);
    this.minPublicationDate.setSeconds(0);
    this.minPublicationDate.setMilliseconds(0);

    const meeting = this.args.meeting;
    // 1. resolve relationships (for use in getters)
    // relationships already loaded in AgendaActionsComponent
    this.internalDocumentPublicationActivity = yield meeting.internalDocumentPublicationActivity;
    this.themisPublicationActivities = yield meeting.themisPublicationActivities;

    // 2. set fields
    this.internalDocumentPublicationDate = this.getSuggestedPublicationDate(this.internalDocumentPublicationActivity);
    this.themisPublicationDate = this.getSuggestedPublicationDate(this.plannedThemisPublicationActivity);
  }

  get plannedThemisPublicationActivity() {
    return AgendaPublicationUtils.getPlannedThemisPublicationActivity(this.themisPublicationActivities);
  }

  get canPublishInternalDocuments() {
    if (!this.internalDocumentPublicationActivity) {
      return true;
    } else {
      return AgendaPublicationUtils.getIsCertainlyNotStarted(this.internalDocumentPublicationActivity);
    }
  }

  get isValid() {
    if (this.initFields.isRunning) {
      return null; // disabled
    }

    let validations = [
      this.isInternalDocumentPublicationDateValid,
      this.isThemisPublicationDateValid,
    ];
    validations = validations.compact(); // skip disabled (null)
    return validations.every((it) => it);
  }

  get isInternalDocumentPublicationDateValid() {
    if (!this.canPublishInternalDocuments) {
      return null; // disabled
    }
    // min date is validated by VlDatepicker
    return this.internalDocumentPublicationDate <= this.themisPublicationDate;
  }

  get isThemisPublicationDateValid() {
    // min date is validated by VlDatepicker
    return this.internalDocumentPublicationDate <= this.themisPublicationDate;
  }

  @action
  setInternalDocumentPublicationDateNow() {
    this.internalDocumentPublicationDate = this.minPublicationDate;
  }

  @action
  setInternalDocumentPublicationDatePicker(date) {
    this.internalDocumentPublicationDate = date;
  }

  @action
  setThemisPublicationDateNow() {
    this.themisPublicationDate = this.minPublicationDate;
  }

  @action
  setThemisPublicationDatePicker(date) {
    this.themisPublicationDate = date;
  }

  @action
  cancel() {
    this.isOpenModal = false;
  }

  get canSave() {
    return this.isValid && !this.save.isRunning;
  }

  @task
  *save() {
    if (!this.isValid) return;

    const saves = [];
    if (this.canPublishInternalDocuments) {
      if (this.internalDocumentPublicationActivity == null) {
        this.internalDocumentPublicationActivity = this.store.createRecord(
          'internal-document-publication-activity',
          {
            meeting: this.args.meeting,
          }
        );
      }
      this.internalDocumentPublicationActivity.startDate = this.internalDocumentPublicationDate;
      const internalDocumentSave = this.internalDocumentPublicationActivity.save();
      saves.push(internalDocumentSave);
    }

    let themisPublicationActivity = this.plannedThemisPublicationActivity;
    if (themisPublicationActivity == null) {
      themisPublicationActivity = this.store.createRecord(
        'themis-publication-activity',
        {
          scope: AgendaPublicationUtils.THEMIS_PUBLICATION_SCOPE_INITIAL,
          meeting: this.args.meeting,
        }
      );
    }
    themisPublicationActivity.startDate = this.themisPublicationDate;
    const themisSave = themisPublicationActivity.save();
    saves.push(themisSave);

    yield Promise.all(saves);

    yield this.args.didSave();
  }

  getSuggestedPublicationDate(xPublicationActivity) {
    if (xPublicationActivity?.startDate != null) {
      return xPublicationActivity.startDate;
    } else {
      const isPlanned = xPublicationActivity?.plannedStart != null;
      const isNotExpired = this.minPublicationDate < xPublicationActivity?.plannedStart;
      if (isPlanned && isNotExpired) {
        return xPublicationActivity.plannedStart;
      } else {
        return this.minPublicationDate;
      }
    }
  }
}

