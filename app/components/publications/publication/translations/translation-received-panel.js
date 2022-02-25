import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { isEmpty } from '@ember/utils';

/**
 *
 * @argument translationActivity
 * @argument onSaveEditReceivedTranslation
 */
export default class PublicationsTranslationTranslationReceivedPanelComponent extends Component {
  @tracked isOpenTranslationEditModal = false;
  @tracked newReceivedDate;

  get isSaveDisabled() {
    return isEmpty(this.newReceivedDate);
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

  @action
  setNewReceivedDate(selectedDates) {
    if (selectedDates.length) {
      this.newReceivedDate = selectedDates[0];
    } else {
      // this case occurs when users manually empty the date input-field
      this.newReceivedDate = undefined;
    }
  }
}
