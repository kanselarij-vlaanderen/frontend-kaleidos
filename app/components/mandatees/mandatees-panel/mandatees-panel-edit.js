import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';

export default class MandateesMandateesPanelEditComponent extends Component {
  /**
   * @argument mandatees
   * @argument submitter
   * @argument onCancel
   * @argument onSave
   * @argument {Date} referenceDate: Date to get active Mandatees for
   */

  @tracked mandateesBuffer = [];
  @tracked submitterBuffer;

  @tracked showSelectMandateeModal = false;

  constructor() {
    super(...arguments);
    this.initBuffers();
  }

  initBuffers() {
    this.mandateesBuffer = this.args.mandatees
      ? this.args.mandatees.slice()
      : []; // Shallow copy
    this.submitterBuffer = this.args.submitter;
  }

  @action
  openSelectMandatee() {
    this.showSelectMandateeModal = true;
  }

  @action
  closeSelectMandatee() {
    this.showSelectMandateeModal = false;
  }

  @action
  async removeMandatee(mandatee) {
    this.mandateesBuffer = this.mandateesBuffer.filter(
      (item) => item !== mandatee
    );
    // eslint-disable-next-line no-self-assign
    this.mandateesBuffer = this.mandateesBuffer; // Trigger plain-array tracking
    // Once removed from related mandatees, a mandatee can no longer be a submitter either
    if (this.submitterBuffer === mandatee) {
      this.submitterBuffer = null;
    }
  }

  @action
  toggleIsSubmitter(mandatee, checked) {
    this.submitterBuffer = checked ? mandatee : null;
  }

  @action
  async addMandatee(mandatee) {
    this.mandateesBuffer.push(mandatee);
    if (this.mandateesBuffer.length === 1) {
      // if this was the first mandatee added, make this one submitter by default
      this.submitterBuffer = mandatee;
    }
    // eslint-disable-next-line no-self-assign
    this.mandateesBuffer = this.mandateesBuffer; // Trigger plain-array tracking

    // Reset interface state
    this.showSelectMandateeModal = false;
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
