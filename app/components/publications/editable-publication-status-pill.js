import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import {
  getPublicationStatusPillKey,
  getPublicationStatusPillStep,
} from 'frontend-kaleidos/utils/publication-auk';
import { task } from 'ember-concurrency';

export default class PublicationStatusPill extends Component {
  @service store;
  @service publicationService;

  @tracked decision;
  @tracked publicationStatus;
  @tracked publicationStatusChange;

  @tracked showStatusSelector = false;

  constructor() {
    super(...arguments);
    this.loadDecision.perform();
    this.loadStatus.perform();
  }

  @task
  *loadDecision() {
    const publicationSubcase = yield this.args.publicationFlow
      .publicationSubcase;
    this.decision = yield this.store.queryOne('decision', {
      'filter[publication-activity][subcase][:id:]': publicationSubcase.id,
      sort: 'publication-activity.start-date,publication-date',
    });
  }

  @task
  *loadStatus() {
    this.publicationStatus = yield this.args.publicationFlow.status;
  }

  get publicationStatusPillKey() {
    return getPublicationStatusPillKey(this.publicationStatus);
  }

  get publicationStatusPillStep() {
    return getPublicationStatusPillStep(this.publicationStatus);
  }

  @action
  openStatusSelector() {
    //TODO Momenteel is er nog geen disabled voor status pill action. De if is om te voorkomen dat de modal ongewenst open gaat
    if (
      !(
        this.publicationStatus.isPublished && this.decision.isStaatsbladResource
      )
    ) {
      this.showStatusSelector = true;
    }
  }

  @action
  closeStatusSelector() {
    this.showStatusSelector = false;
  }

  @task
  *savePublicationStatus(status, changeDate) {
    const previousStatus = this.publicationStatus;
    if (previousStatus != status) {
      yield this.publicationService.updatePublicationStatus(
        this.args.publicationFlow,
        status.uri,
        changeDate
      );
      this.loadStatus.perform();
      this.loadDecision.perform();
      this.args.onChange();
    }
    this.closeStatusSelector();
  }
}
