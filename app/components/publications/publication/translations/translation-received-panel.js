import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { isEmpty } from '@ember/utils';

export default class PublicationsTranslationTranslationReceivedPanelComponent extends Component {
  /**
   *
   * @argument translationActivity
   * @argument onSave
   */

  @tracked isOpenTranslationEditModal = false;
  @tracked newEndDate;

  get isSaveDisabled() {
    return isEmpty(this.newEndDate);
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

  @action
  setEndDate(selectedDates) {
    if (selectedDates.length) {
      this.newEndDate = selectedDates[0];
    } else {
      // this case occurs when users manually empty the date input-field
      this.newEndDate = undefined;
    }
  }
}
