import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
/**
 * @argument {TranslationSubcase}
 * @argument {PublicationFlow}
 * @argument {onSave}
 */
export default class PublicationsPublicationCaseContactPersonsPanelComponent extends Component {
  @service store;

  @tracked isEditing = false;
  @tracked publicationStatus;

  @tracked dueDate;

  constructor() {
    super(...arguments);
    this.loadStatus.perform();
  }

  @task
  *loadStatus() {
    this.publicationStatus = yield this.args.publicationFlow.status;
  }

  @action
  openEditingPanel() {
    this.isEditing = true;
    this.dueDate = this.args.translationSubcase.dueDate;
  }

  @action
  closeEditingPanel() {
    this.isEditing = false;
  }

  @action
  setTranslationDueDate(selectedDates) {
    this.dueDate = selectedDates[0];
  }

  @task
  *save() {
    yield this.args.onSave({
      dueDate: this.dueDate,
    });
    this.isEditing = false;
  }
}
