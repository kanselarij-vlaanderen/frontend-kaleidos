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
  async closeEditingPanel() {
    this.isEditing = false;
    await this.args.translationSubcase.rollbackAttributes();
  }

  @action
  setTranslationDueDate(selectedDates) {
    this.args.translationSubcase.dueDate = selectedDates[0];
  }

  @task
  *save() {
    const translationSubcase = this.args.translationSubcase;
    yield translationSubcase.save();
    this.isEditing = false;
  }
}
