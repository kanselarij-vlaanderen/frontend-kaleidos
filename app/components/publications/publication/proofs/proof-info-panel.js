import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
/**
 * @argument {PublicationSubcase}
 * @argument {isFinal} if publication status is in final state
 */
export default class PublicationsPublicationProofsProofInfoPanelComponent extends Component {
  @tracked isEditing = false;

  @action
  openEditingPanel() {
    this.isEditing = true;
  }

  @action
  closeEditingPanel() {
    this.isEditing = false;
    this.args.publicationSubcase.rollbackAttributes();
  }

  @task
  *save() {
    yield this.args.publicationSubcase.save();
    this.isEditing = false;
  }
}
