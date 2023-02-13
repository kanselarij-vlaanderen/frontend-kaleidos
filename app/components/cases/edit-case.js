import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { isBlank } from '@ember/utils';
import { task } from 'ember-concurrency';

/**
 * @param {Case} case
 */
export default class EditCase extends Component {
  @tracked shortTitle;

  constructor() {
    super(...arguments);

    this.shortTitle = this.args.case.shortTitle;
  }

  get isSaveDisabled() {
    return (
      isBlank(this.shortTitle) ||
      this.save.isRunning
    );
  }

  @task
  *save() {
    this.args.case.shortTitle = this.shortTitle;
    yield this.args.onSave(this.args.case);
  }

  @action
  close() {
    this.args.onClose();
  }
}
