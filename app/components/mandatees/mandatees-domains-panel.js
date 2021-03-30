import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';

export default class MandateesMandateesDomainsPanelComponent extends Component {
  /**
   * @argument mandatees
   * @argument submitter
   * @argument fields
   * @argument allowEditing
   * @argument onSave
   */
  @tracked isEditing = false;

  @action
  startEditing() {
    this.isEditing = true;
  }

  @action
  cancelEditing() {
    this.isEditing = false;
  }

  @task
  *save() {
    if (this.args.onSave) {
      yield this.args.onSave(...arguments);
    }
    this.isEditing = false;
  }
}
