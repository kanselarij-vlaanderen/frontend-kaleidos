import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
/**
 * @argument {PublicationSubcase}
 * @argument {isFinal} if publication status is in final state
 */
export default class PublicationsPublicationProofsProofInfoPanelComponent extends Component {
  @service store;

  @tracked isEditing = false;

  @action
  openEditingPanel() {
    this.isEditing = true;
  }

  @action
  async closeEditingPanel() {
    this.isEditing = false;
    await this.args.publicationSubcase.rollbackAttributes();
  }

  @action
  setPublicationDueDate(selectedDates) {
    this.args.publicationSubcase.dueDate = selectedDates[0];
  }

  @task
  *save() {
    const publicationSubcase = this.args.publicationSubcase;
    yield publicationSubcase.save();
    this.isEditing = false;
  }


}
