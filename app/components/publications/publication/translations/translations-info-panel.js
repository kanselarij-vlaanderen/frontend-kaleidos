import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
/**
 * @argument {TranslationSubcase}
 * @argument {isFinal} if publication status is in final state
 */
export default class PublicationsPublicationTranslationsTranslationsInfoPanelComponent extends Component {
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

  @task
  *save() {
    yield this.args.translationSubcase.save();
    this.isEditing = false;
  }
}
