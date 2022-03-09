import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';

/**
 *
 * @argument translationActivity
 * @argument publicationFlow
 * @argument onUpdateTranslationActivity
 */
export default class PublicationsTranslationTranslationReceivedPanelComponent extends Component {
  @tracked isOpenTranslationEditModal = false;
  @tracked isOpenProofRequestModal = false;

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
