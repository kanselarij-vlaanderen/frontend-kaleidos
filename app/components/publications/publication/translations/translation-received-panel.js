import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

/**
 *
 * @argument translationActivity
 * @argument publicationFlow
 * @argument onEditTranslationActivity
 */
export default class PublicationsTranslationTranslationReceivedPanelComponent extends Component {
  @tracked isOpenTranslationEditModal = false;
  @tracked isOpenProofRequestModal = false;

  editTranslationActivity = task(async (data) => {
    await this.args.onEditTranslationActivity({
      translationActivity: this.args.translationActivity,
      receivedDate: data.receivedDate,
    });
    this.closeTranslationEditModal();
  });

  createProofRequest = task(async (proofRequestArgs) => {
    await this.args.onCreateProofRequest(proofRequestArgs);
    this.isOpenProofRequestModal = false;
  });

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
