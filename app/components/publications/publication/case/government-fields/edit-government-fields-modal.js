import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';


export default class EditGovernmentFieldsModal extends Component {
  @service store;
  @tracked governmentFields;
  @tracked selectedGovernmentFields;

  constructor() {
    super(...arguments);
    this.governmentFields = this.store.peekAll('government-field').sortBy('position');
    this.selectedGovernmentFields = this.args.governmentFields;
  }

  @task
  *save() {
    yield this.args.onSave(
      this.selectedGovernmentFields
    );
  }

  @action
  select(selectedFields) {
    this.selectedGovernmentFields.pushObjects(selectedFields);
  }

  @action
  deselect(selectedFields) {
    this.selectedGovernmentFields.removeObjects(selectedFields);
  }
}
