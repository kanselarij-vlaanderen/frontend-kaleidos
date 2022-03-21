import Component from '@glimmer/component';
import { action } from '@ember/object';
import { isBlank } from '@ember/utils';
import { task } from 'ember-concurrency';

export default class EditCase extends Component {
  get isSaveDisabled() {
    return isBlank(this.args.case.shortTitle);
  }

  @task
  *save() {
    yield this.args.onSave(this.args.case);
  }

  @action
  close() {
    this.args.case.rollbackAttributes();
    this.args.onClose();
  }
}
