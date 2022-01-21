import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';

export default class PublicationsPublicationCaseRemarkPanelComponent extends Component {
  @tracked isInEditMode;

  @tracked remark;

  @action
  putInEditMode() {
    const publicationFlow = this.args.publicationFlow;
    this.isInEditMode = true;
    this.remark = publicationFlow.remark;
  }

  @action
  cancelEdit() {
    this.showError = false;
    this.isInEditMode = false;
  }

  @task
  *save() {
    const publicationFlow = this.args.publicationFlow;
    publicationFlow.remark = this.remark;
    // no try-catch: don't exit if save didn't work
    yield publicationFlow.save();
    this.isInEditMode = false;
  }
}
