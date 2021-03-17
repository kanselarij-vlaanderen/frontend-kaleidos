import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';

export default class MandateesMandateesDomainsPanelEditComponent extends Component {
  /**
   * @argument mandatees
   * @argument submitter
   * @argument fields
   * @argument onCancel
   * @argument onSave
   */
  @service store;

  @tracked mandateesBuffer;
  @tracked submitterBuffer;
  @tracked fieldsBuffer;

  @tracked isShowingEditMandateeModal = false;
  @tracked mandateeUnderEdit;

  constructor() {
    super(...arguments);
    this.initBuffers();
  }

  initBuffers() {
    this.mandateesBuffer = this.args.mandatees ? this.args.mandatees.slice() : []; // Shallow copy
    this.submitterBuffer = this.args.submitter;
    this.fieldsBuffer = this.args.fields ? this.args.fields.slice() : []; // Shallow copy
  }

  @action
  startCreatingMandatee() {
    this.isShowingEditMandateeModal = true;
  }

  @action
  startEditingMandatee(mandatee) {
    this.isShowingEditMandateeModal = true;
    this.mandateeUnderEdit = mandatee;
  }

  @action
  cancelEditingMandatee() {
    this.isShowingEditMandateeModal = false;
    this.mandateeUnderEdit = null;
  }

  @action
  removeMandatee(mandatee) {
    this.mandateesBuffer = this.mandateesBuffer.filter((item) => item !== mandatee);
    // eslint-disable-next-line no-self-assign
    this.mandateesBuffer = this.mandateesBuffer; // Trigger plain-array tracking
  }

  @action
  toggleIsSubmitter(mandatee, flag) {
    this.submitterBuffer = flag ? mandatee : null;
  }

  @action
  async modifyMandateeAndFields(mandateeAndFields) {
    // potential mandatee addition
    if (!this.mandateeUnderEdit) { // if none was existant yet, we expect one to have been added
      this.mandateesBuffer.push(mandateeAndFields.mandatee);
      // eslint-disable-next-line no-self-assign
      this.mandateesBuffer = this.mandateesBuffer; // Trigger plain-array tracking
    }
    // Fields modifications
    let mandateeFields = await this.store.query('government-field', {
      'filter[ise-code][mandatees][:id:]': mandateeAndFields.mandatee.id,
    });
    mandateeFields = mandateeFields.toArray();
    const fieldsToRemove = this.fieldsBuffer.filter((field) => !mandateeAndFields.fields.includes(field) && mandateeFields.includes(field));
    const fieldsToAdd = mandateeAndFields.fields.filter((field) => !this.fieldsBuffer.includes(field));
    this.fieldsBuffer = this.fieldsBuffer.filter((field) => !fieldsToRemove.includes(field));
    this.fieldsBuffer = this.fieldsBuffer.concat(fieldsToAdd);
    // Reset interface state
    this.isShowingEditMandateeModal = false;
    this.mandateeUnderEdit = null;
  }

  @task
  *save() {
    if (this.args.onSave) {
      yield this.args.onSave({
        mandatees: this.mandateesBuffer,
        submitter: this.submitterBuffer,
        fields: this.fieldsBuffer,
      });
    }
    this.isEditing = false;
    this.initBuffers();
  }

  @action cancel() {
    if (this.args.onCancel) {
      this.args.onCancel();
    }
  }
}
