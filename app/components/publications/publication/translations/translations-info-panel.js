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

  @tracked dueDate;

  constructor() {
    super(...arguments);
    this.initFields();
  }

  initFields() {
    this.dueDate = this.args.translationSubcase.dueDate;
  }

  @action
  openEditingPanel() {
    this.isEditing = true;
  }

  @action
  closeEditingPanel() {
    this.isEditing = false;
    this.initFields();
  }

  @action
  setTranslationDueDate(selectedDates) {
    this.dueDate = selectedDates[0];
  }

  @task
  *save() {
    yield this.performSave();
    this.isEditing = false;
  }

  async performSave() {
    const translationSubcase = this.args.translationSubcase;
    translationSubcase.dueDate = this.dueDate;

    await translationSubcase.save();
  }
}
