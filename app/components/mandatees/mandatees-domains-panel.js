import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';

export default class MandateesMandateesDomainsPanelComponent extends Component {
  /**
   * @argument mandatees
   * @argument submitter
   * @argument allowEditing
   * @argument onSave
   */
  @tracked isEditing = false;
  @tracked mandateesBuffer;
  @tracked submitterBuffer;

  @action
  initializeBuffers() {
    this.mandateesBuffer = this.args.mandatees.slice(); // Shallow copy
    this.submitterBuffer = this.args.submitter;
  }

  @action
  startEditing() {
    this.initializeBuffers();
    this.isEditing = true;
  }

  @action
  addMandatee(mandatee) {
    this.mandateesBuffer.push(mandatee);
    // eslint-disable-next-line no-self-assign
    this.mandateesBuffer = this.mandateesBuffer; // Trigger plain-array tracking
  }

  @action
  removeMandatee(mandatee) {
    this.mandateesBuffer = this.mandateesBuffer.filter((item) => item !== mandatee);
    // eslint-disable-next-line no-self-assign
    this.mandateesBuffer = this.mandateesBuffer; // Trigger plain-array tracking
  }

  @action
  setSubmitter(submitter) {
    this.submitterBuffer = submitter;
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
    this.mandateesBuffer = [];
    this.submitterBuffer = this.args.submitter;
  }

  @action
  cancelEditing() {
    this.isEditing = false;
    this.mandateesBuffer = [];
    this.submitterBuffer = this.args.submitter;
  }
}
