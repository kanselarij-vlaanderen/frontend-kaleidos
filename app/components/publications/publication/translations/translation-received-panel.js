import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { isEmpty } from '@ember/utils';
import { inject as service } from '@ember/service';

export default class PublicationsTranslationTranslationReceivedPanelComponent extends Component {
  /**
   *
   * @argument translationActivity
   * @argument publicationFlow
   * @argument onSave
   */

  @service router;
  @service publicationService;

  @tracked isOpenTranslationEditModal = false;
  @tracked isOpenProofRequestModal = false;

  @tracked newEndDate;

  get isSaveDisabled() {
    return isEmpty(this.newEndDate);
  }

  get piecesOfTranslation() {
    return [
      ...this.args.translationActivity.usedPieces.toArray(),
      ...this.args.translationActivity.generatedPieces.toArray(),
    ];
  }

  @action
  toggleTranslationEditModal() {
    this.isOpenTranslationEditModal = !this.isOpenTranslationEditModal;
    // When opening modal, reset possibly stale newEndDate to current endDate
    if (this.isOpenTranslationEditModal) {
      this.newEndDate = this.args.translationActivity.endDate;
    }
  }

  @task
  *saveEndDate() {
    yield this.args.onSave(this.args.translationActivity, this.newEndDate);
    this.toggleTranslationEditModal();
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
  setEndDate(selectedDates) {
    if (selectedDates.length) {
      this.newEndDate = selectedDates[0];
    } else {
      // this case occurs when users manually empty the date input-field
      this.newEndDate = undefined;
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
