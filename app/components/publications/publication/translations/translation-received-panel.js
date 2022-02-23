import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';

export default class PublicationsTranslationTranslationReceivedPanelComponent extends Component {
  @tracked isOpenTranslationEditModal = false;
  @tracked endDate = this.args.translationActivity.endDate;

  @action
  toggleTranslationEditModal(){
    this.isOpenTranslationEditModal = !this.isOpenTranslationEditModal;
  }

  @task
  *save() {
    yield this.args.onSave(this.args.translationActivity, this.endDate);
    this.toggleTranslationEditModal();
  }

  @action
  setEndDate(selectedDates) {
    if (selectedDates.length) {
      this.endDate = selectedDates[0];
    } else {
      // this case occurs when users manually empty the date input-field
      // using the old value to fallback on, clearing date should not be allowed
      this.endDate = this.args.translationActivity.endDate;
    }
  }
}
