import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { getPublicationStatusPillKey, getPublicationStatusPillStep } from 'frontend-kaleidos/utils/publication-auk';

export default class PublicationsTableRowComponent extends Component {
  @service router;
  @service store;
  @service publicationService;

  @tracked isViaCouncilOfMinisters;
  @tracked publicationDate;
  @tracked numberOfPages;
  @tracked proofRequestDate;
  @tracked publicationStatus;

  constructor() {
    super(...arguments);
    this.loadData.perform();
    if (this.args.tableColumnDisplayOptions.status) {
      this.loadPublicationStatus.perform();
    }
  }

  @task
  *loadData() {
    if (this.args.tableColumnDisplayOptions.source) {
      this.isViaCouncilOfMinisters =
      yield this.publicationService.getIsViaCouncilOfMinisters(this.args.publicationFlow);
    }
    if (this.args.tableColumnDisplayOptions.proofRequestDate) {
      this.proofRequestDate = yield this.getProofRequestDate(this.args.publicationFlow);
    }
    if (this.args.tableColumnDisplayOptions.publicationDate) {
      this.publicationDate = yield this.publicationService.getPublicationDate(
        this.args.publicationFlow
      );
    }
  }

  @task
  *loadPublicationStatus() {
    this.publicationStatus = yield this.args.publicationFlow.status;
  }

  get publicationStatusPillKey() {
    return this.publicationStatus && getPublicationStatusPillKey(this.publicationStatus);
  }

  get publicationStatusPillStep() {
    return this.publicationStatus && getPublicationStatusPillStep(this.publicationStatus);
  }

  async getProofRequestDate(publicationFlow) {
    const publicationSubcase = await publicationFlow.publicationSubcase;
    const proofingActivities = await publicationSubcase.proofingActivities;
    const startDates = proofingActivities.mapBy('startDate');
    startDates.sort();
    const firstProofRequestDate = startDates[0];
    return firstProofRequestDate;
  }

  // TODO: review async getter once ember-resources can be used
  get isTranslationOverdue() {
    return (
      !this.args.publicationFlow.status.get('isFinal') &&
      this.args.publicationFlow.translationSubcase.get('isOverdue')
    );
  }

  // TODO: review async getter once ember-resources can be used
  get isPublicationOverdue() {
    return (
      !this.args.publicationFlow.status.get('isFinal') &&
      this.args.publicationFlow.publicationSubcase.get('isOverdue')
    );
  }

  @action
  navigateToPublication() {
    this.router.transitionTo(
      'publications.publication',
      this.args.publicationFlow.id
    );
  }
}
