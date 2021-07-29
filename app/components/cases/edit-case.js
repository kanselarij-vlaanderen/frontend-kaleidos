import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { action } from '@ember/object';

export default class EditCase extends Component {
  @tracked shortTitle = this.args.case.shortTitle;
  @tracked isConfidential = this.args.case.confidential;

  get isSaveDisabled() {
    return this.shortTitle === null || this.shortTitle.trim().length === 0;
  }

  @action
  toggleConfidential() {
    this.isConfidential = !this.isConfidential;
  }

  @task
  *save() {
    yield this.args.onSave(
      {
        shortTitle: this.shortTitle,
        confidential: this.isConfidential,
      });
  }
}
