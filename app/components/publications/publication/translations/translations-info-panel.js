import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
/**
 * @argument {TranslationSubcase}
 * @argument {isFinal} if publication status is in final state
 */
export default class PublicationsPublicationTranslationsTranslationsInfoPanelComponent extends Component {
  @service store;

  @tracked isEditing = false;

  @action
  openEditingPanel() {
    this.isEditing = true;
  }

  @action
  closeEditingPanel() {
    this.isEditing = false;
    this.args.translationSubcase.rollbackAttributes();
  }

  @action
  setTranslationDueDate(selectedDates) {
    this.args.translationSubcase.dueDate = selectedDates[0];
  }

  @task
  *save() {
    yield this.args.translationSubcase.save();
    this.isEditing = false;
  }
}
