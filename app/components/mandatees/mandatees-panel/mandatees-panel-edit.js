import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';

export default class MandateesMandateesPanelEditComponent extends Component {
  /**
   * @argument mandatees
   * @argument submitter
   * @argument onCancel
   * @argument onSave
   */
  @service store;

  @tracked mandateesBuffer;
  @tracked submitterBuffer;

  @tracked isShowingEditMandateeModal = false;
  @tracked mandateeUnderEdit;

  constructor() {
    super(...arguments);
    this.initBuffers();
  }

  initBuffers() {
    this.mandateesBuffer = this.args.mandatees ? this.args.mandatees.slice() : []; // Shallow copy
    this.submitterBuffer = this.args.submitter;
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
  async removeMandatee(mandatee) {
    this.mandateesBuffer = this.mandateesBuffer.filter((item) => item !== mandatee);
    // eslint-disable-next-line no-self-assign
    this.mandateesBuffer = this.mandateesBuffer; // Trigger plain-array tracking
    // Once removed from related mandatees, a mandatee can no longer be a submitter either
    if (this.submitterBuffer === mandatee) {
      this.submitterBuffer = null;
    }

  }

  @action
  toggleIsSubmitter(mandatee, event) {
    const flag = event.target.checked;
    this.submitterBuffer = flag ? mandatee : null;
  }

  @action
  async modifyMandatee(mandatee) {
    // potential mandatee addition
    if (!this.mandateeUnderEdit) { // if none was existant yet, we expect one to have been added
      this.mandateesBuffer.push(mandatee.mandatee);
      if (this.mandateesBuffer.length === 1) { // if this was the first mandatee added, make this one submitter by default
        this.submitterBuffer = mandatee.mandatee;
      }
      // eslint-disable-next-line no-self-assign
      this.mandateesBuffer = this.mandateesBuffer; // Trigger plain-array tracking
    }
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
