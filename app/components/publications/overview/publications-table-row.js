import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { getPublicationStatusPillKey, getPublicationStatusPillStep } from 'frontend-kaleidos/utils/publication-auk';
import maxDate from 'date-fns/max';

export default class PublicationsTableRowComponent extends Component {
  @service router;
  @service publicationService;

  @tracked isViaCouncilOfMinisters;
  @tracked publicationDate;
  @tracked translationRequestDate;
  @tracked proofRequestDate;
  @tracked proofReceivedDate;
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
    if (this.args.tableColumnDisplayOptions.translationRequestDate) {
      this.translationRequestDate = yield this.getTranslationRequestDate(this.args.publicationFlow);
    }
    if (this.args.tableColumnDisplayOptions.proofRequestDate) {
      this.proofRequestDate = yield this.getProofRequestDate(this.args.publicationFlow);
    }
    if (this.args.tableColumnDisplayOptions.proofReceivedDate) {
      this.proofReceivedDate = yield this.getProofReceivedDate(this.args.publicationFlow);
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

  /** @returns {Date?} undefined if no translation-activities */
  async getTranslationRequestDate(publicationFlow) {
    const publicationSubcase = await publicationFlow.translationSubcase;
    const translationActivities = await publicationSubcase.translationActivities;
    const requestDates = translationActivities.map((a) => a.startDate).filter(d => d);
    return requestDates.length ? maxDate(requestDates) : null;
  }

  /** @returns {Date?} undefined if no ProofingActivities */
  async getProofRequestDate(publicationFlow) {
    const publicationSubcase = await publicationFlow.publicationSubcase;
    const proofingActivities = await publicationSubcase.proofingActivities;
    const requestDates = proofingActivities.map((a) => a.startDate).filter(d => d);
    return requestDates.length ? maxDate(requestDates) : null;
  }

  /** @returns {Date?} undefined if no ProofingActivities or a ProofingActivity is not finished */
  async getProofReceivedDate(publicationFlow) {
    const publicationSubcase = await publicationFlow.publicationSubcase;
    const proofingActivities = await publicationSubcase.proofingActivities;
    const receivedDates = proofingActivities.map((a) => a.endDate).filter(d => d);
    return receivedDates.length ? maxDate(receivedDates) : null;
  }

  // TODO: review async getter once ember-resources can be used
  get isTranslationOverdue() {
    return (
      !this.args.publicationFlow.status.get('isFinal') &&
      this.args.publicationFlow.translationSubcase.get('isOverdue')
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
