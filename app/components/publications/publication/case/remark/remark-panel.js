import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class PublicationsPublicationCaseRemarkPanelComponent extends Component {
  @tracked isEditing;

  // copied properties
  // reason: prevent editing the publation-flow record directly,
  // in order to prevent commiting changes when saving the publication-flow record in another panel
  @tracked remark;

  @action
  openEditingPanel() {
    this.isEditing = true;
    this.remark = this.args.publicationFlow.remark;
  }

  @action
  closeEditingPanel() {
    this.isEditing = false;
  }

  @task
  *save() {
    this.args.publicationFlow.remark = this.remark;
    // no try-catch: don't exit edit-mode if save didn't work
    yield this.args.publicationFlow.save();
    this.isEditing = false;
  }
}
