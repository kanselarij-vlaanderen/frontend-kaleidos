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
    this.loadDisplayData.perform() // also needed in view-component => renderless MandateeDomainsFields
  }

  initBuffers() {
    this.mandateesBuffer = this.args.mandatees.slice(); // Shallow copy
    this.submitterBuffer = this.args.submitter;
    this.fieldsBuffer = this.args.fields.slice(); // Shallow copy
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

  removeMandatee(mandatee) {
    this.mandateesBuffer = this.mandateesBuffer.filter((item) => item !== mandatee);
    // eslint-disable-next-line no-self-assign
    this.mandateesBuffer = this.mandateesBuffer; // Trigger plain-array tracking
  }

  @action
  toggleIsSubmitter(mandatee, flag) {
    this.submitterBuffer = flag ? mandatee : null;
  }
  }

  @task
  *save() {
    if (this.args.onSave) {
      yield this.args.onSave(this.mandateesBuffer);
    }
    this.isEditing = false;
    this.mandateesBuffer = [];
  }

  @action cancel() {
    if (this.args.onCancel) {
      this.args.onCancel();
    }
  }
}
