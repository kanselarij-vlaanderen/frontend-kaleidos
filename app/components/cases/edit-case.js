import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { action } from '@ember/object';

export default class EditCase extends Component {


  get isSaveDisabled() {
    return this.args.case.shortTitle === null || this.args.case.shortTitle.trim().length === 0;
  }

  @action
  toggleConfidential() {
    this.args.case.confidential = !this.args.case.confidential ;
  }

  @task
  *save() {
    yield this.args.onSave(this.args.case);
  }

  @action
  onClose() {
    this.args.case.rollbackAttributes();
    this.args.onClose();
  }
}
