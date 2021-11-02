import Component from '@glimmer/component';
import { task } from 'ember-concurrency-decorators';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class MandateesMandateesDomainsSelectorModalComponent extends Component {
  /**
   * @argument mandatee: mandatee we want to select fields for, or undefined when a mandatee needs to be selected too
   * @argument fields: fields to mark as selected
   * @argument onSave
   * @argument onCancel
   */
  @service store;

  @tracked mandateeBuffer;
  @tracked availableFields; // selectableFields
  @tracked fieldsBuffer; // selectedFields

  @tracked isLoading;

  get isAddingMinister() {
    return !this.mandateeBuffer;
  }

  constructor() {
    super(...arguments);
    this.mandateeBuffer = this.args.mandatee;
  }


  @task
  *save() {
    if (this.args.onSave) {
      yield this.args.onSave({
        mandatee: this.mandateeBuffer,
        fields: this.fieldsBuffer,
      });
    }
  }

  @action
  selectMandatee(mandatee) {
    this.mandateeBuffer = mandatee;
  }

  @action
  cancel() {
    if (this.args.onCancel) {
      this.args.onCancel();
    }
  }
}
