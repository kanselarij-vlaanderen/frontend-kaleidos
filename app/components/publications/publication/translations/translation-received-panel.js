import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
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

  get piecesOfTranslation() {
    return [
      ...this.args.translationActivity.usedPieces.toArray(),
      ...this.args.translationActivity.generatedPieces.toArray(),
    ];
  }

  @task
  *updateTranslationActivity() {
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
  openTranslationEditModal() {
    this.isOpenTranslationEditModal = true;
  }

  @action
  closeTranslationEditModal() {
    this.isOpenTranslationEditModal = false;
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
