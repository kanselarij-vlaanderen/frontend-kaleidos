import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';
import { isEmpty } from '@ember/utils';
import { getPublicationStatusPillKey,getPublicationStatusPillStep } from 'frontend-kaleidos/utils/publication-auk';

export default class EditablePublicationStatusPill extends Component {
  @service store;
  @service currentPublicationFlow;

  @tracked decision;
  @tracked publicationStatus;

  @tracked showStatusSelector = false;

  constructor() {
    super(...arguments);
    this.loadDecision.perform();
    this.loadStatus.perform();
  }

  @task
  *loadDecision() {
    const publicationSubcase = yield this.currentPublicationFlow.publicationFlow.publicationSubcase;
    this.decision = yield this.store.queryOne('decision', {
      'filter[publication-activity][subcase][:id:]': publicationSubcase.id,
      sort: 'publication-activity.start-date,publication-date',
    });
  }

  @task
  *loadStatus() {
    this.publicationStatus = yield this.currentPublicationFlow.publicationFlow.status;
  }

  get publicationStatusPillKey() {
    return getPublicationStatusPillKey(this.currentPublicationFlow.publicationFlow.status);
  }

  get publicationStatusPillStep() {
    return getPublicationStatusPillStep(this.currentPublicationFlow.publicationFlow.status);
  }

  @action
  openStatusSelector() {
    //TODO Momenteel is er nog geen disabled voor status pill action. De if is om te voorkomen dat de modal ongewenst open gaat
    if (!(this.publicationStatus.isPublished && this.decision?.isStaatsbladResource)){
      this.showStatusSelector = true;
    }
  }

  @action
  closeStatusSelector() {
    this.showStatusSelector = false;
  }

  @task
  *savePublicationStatus(status, date) {
    if (isEmpty(date)) {
      date = new Date();
    }

    // update status
    this.currentPublicationFlow.publicationFlow.status = status;

    // update closing dates of auxiliary activities if status is "published"
    if (status.isFinal) {
      this.currentPublicationFlow.publicationFlow.closingDate = date;

      const translationSubcase = yield this.currentPublicationFlow.publicationFlow.translationSubcase;
      if (!translationSubcase.endDate) {
        translationSubcase.endDate = date;
        yield translationSubcase.save();
      }

      const publicationSubcase = yield this.currentPublicationFlow.publicationFlow.publicationSubcase;
      if (!publicationSubcase.endDate) {
        publicationSubcase.endDate = date;
        yield publicationSubcase.save();
      }

      // create decision for publication activity when status changed to "published"
      if (status.isPublished && !this.decision) {
        const publicationActivities = yield publicationSubcase.publicationActivities;

        if (publicationActivities.length) {
          const publicationActivity = publicationActivities.objectAt(0);
          this.decision = this.store.createRecord('decision', {
            publicationActivity: publicationActivity,
            publicationDate: date,
          });
          this.decision.save();
        }
      }
    } else {
      this.currentPublicationFlow.publicationFlow.closingDate = null;
    }

    // remove decision if "published" status is reverted and it's not a Staatsblad resource
    const previousStatus = this.publicationStatus;
    if ((previousStatus.isPublished && !status.isPublished)
             && (this.decision && !this.decision.isStaatsbladResource)) {
      yield this.decision.destroyRecord();
    }

    // update status-change activity
    const oldChangeActivity = yield this.currentPublicationFlow.publicationFlow.publicationStatusChange;
    if (oldChangeActivity) {
      yield oldChangeActivity.destroyRecord();
    }
    const newChangeActivity = this.store.createRecord('publication-status-change', {
      startedAt: date,
      publication: this.currentPublicationFlow.publicationFlow,
    });
    yield newChangeActivity.save();

    yield this.currentPublicationFlow.save();
    this.loadStatus.perform();
    this.closeStatusSelector();
  }
}
