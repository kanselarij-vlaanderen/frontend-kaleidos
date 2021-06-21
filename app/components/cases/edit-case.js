import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';

export default class EditCaseComponent extends Component {
  @tracked shortTitle;

  @action
  onChange() {
    console.log('Update');
    this.shortTitle = this.args.caseToEdit.shortTitle;
  }

  @task
  *editCaseTask() {
    this.args.caseToEdit.shortTitle = this.shortTitle;
    yield this.args.caseToEdit.save();
    this.args.onClose();
  }
}
