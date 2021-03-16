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
    if (this.args.fields) {
      this.fieldsBuffer = [...this.args.fields]; // Shallow copy array
    } else {
      this.fieldsBuffer = [];
    }
    if (!this.isAddingMinister) {
      this.loadAvailableFieldsForMandatee.perform();
    }
  }

  @task
  *loadAvailableFieldsForMandatee() {
    const fields = yield this.store.query('government-field', {
      'filter[ise-code][mandatees][:id:]': this.mandateeBuffer.id,
    });
    this.availableFields = fields.toArray();
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
    this.loadAvailableFieldsForMandatee.perform();
  }

  @action
  selectFields(fields) {
    this.fieldsBuffer = this.fieldsBuffer.concat(fields);
  }

  @action
  unSelectFields(fields) {
    this.fieldsBuffer = this.fieldsBuffer.filter((field) => !fields.includes(field));
  }

  @action
  cancel() {
    if (this.args.onCancel) {
      this.args.onCancel();
    }
  }
}
