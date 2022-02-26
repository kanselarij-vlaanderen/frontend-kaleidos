import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { isEmpty } from '@ember/utils';
import { inject as service } from '@ember/service';

/**
 *
 * @argument translationActivity
 * @argument publicationFlow
 * @argument onSaveEditReceivedTranslation
 */
export default class PublicationsTranslationTranslationReceivedPanelComponent extends Component {

  @service router;
  @service publicationService;

  @tracked isOpenTranslationEditModal = false;
  @tracked isOpenProofRequestModal = false;

  @tracked newEndDate;
  @tracked newReceivedDate;

  get isSaveDisabled() {
    return isEmpty(this.newReceivedDate);
  }

  get piecesOfTranslation() {
    return [
      ...this.args.translationActivity.usedPieces.toArray(),
      ...this.args.translationActivity.generatedPieces.toArray(),
    ];
  }

  @action
  openTranslationEditModal() {
    this.isOpenTranslationEditModal = true;
    // When opening modal, reset possibly stale local variable
    this.newReceivedDate = this.args.translationActivity.endDate;
  }

  @action
  closeTranslationEditModal() {
    this.isOpenTranslationEditModal = false;
  }

  @task
  *saveReceivedDate() {
    yield this.args.onSaveEditReceivedTranslation({
      translationActivity: this.args.translationActivity,
      receivedDate: this.newReceivedDate,
    });
    this.closeTranslationEditModal();
  }

  @task
  *saveProofRequest(proofRequest) {
    const publicationSubcase = yield this.args.publicationFlow
      .publicationSubcase;
    yield this.publicationService.createProofRequestActivity(
      proofRequest,
      publicationSubcase,
      this.args.publicationFlow
    );

    this.isOpenProofRequestModal = false;
    this.router.transitionTo('publications.publication.proofs');
  }

  @action
  setNewReceivedDate(selectedDates) {
    if (selectedDates.length) {
      this.newReceivedDate = selectedDates[0];
    } else {
      // this case occurs when users manually empty the date input-field
      this.newReceivedDate = undefined;
    }
  }

  @action
  openProofRequestModal() {
    this.isOpenProofRequestModal = true;
  }

  @action
  closeProofRequestModal() {
    this.isOpenProofRequestModal = false;
  }
}
