import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { inject as service } from '@ember/service';

/**
 *
 * @argument translationActivity
 * @argument publicationFlow
 * @argument onUpdateTranslationActivity
 */
export default class PublicationsTranslationTranslationReceivedPanelComponent extends Component {
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
  *updateTranslationActivity(data) {
    yield this.args.onUpdateTranslationActivity({
      translationActivity: this.args.translationActivity,
      receivedDate: data.receivedDate,
    });
    this.closeTranslationEditModal();
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
