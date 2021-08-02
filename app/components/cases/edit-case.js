import Component from '@glimmer/component';
import { task } from 'ember-concurrency-decorators';
import { action } from '@ember/object';
import { isBlank } from '@ember/utils';

export default class EditCase extends Component {
  get isSaveDisabled() {
    return isBlank(this.args.case.shortTitle);
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
