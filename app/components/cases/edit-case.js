import Component from '@glimmer/component';
import { task } from 'ember-concurrency-decorators';

export default class EditCaseComponent extends Component {
  @task
  *editCaseTask() {
    yield this.args.caseToEdit.save();
    this.args.onClose();
  }
}
