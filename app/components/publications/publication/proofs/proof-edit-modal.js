import Component from '@glimmer/component';
import { action } from '@ember/object';
import { isPresent } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { ValidatorSet, Validator } from 'frontend-kaleidos/utils/validators';

/**
 * @argument ProofingActivity
 * @argument ProofPrintCorrector
 * @argument onSave
 * @argument onCancel
 */
export default class PublicationsPublicationProofsProofEditModalComponent extends Component {
  @tracked receivedAtDate = this.args.proofingActivity.endDate;
  @tracked proofPrintCorrector = this.args.proofPrintCorrector;

  validators;

  constructor() {
    super(...arguments);
    this.initValidation();
  }

  get isCancelDisabled() {
    return this.save.isRunning;
  }

  get isSaveDisabled() {
    return !this.validators.areValid;
  }

  @task
  *save() {
    yield this.args.onSave({
      proofingActivity: this.args.proofingActivity,
      receivedAtDate: this.receivedAtDate,
      proofPrintCorrector: this.proofPrintCorrector,
    });
  }

  @action
  setReceivedAtDate(selectedDates) {
    if (selectedDates.length) {
      this.receivedAtDate = selectedDates[0];
    } else {
      // this case occurs when users manually empty the date input-field
      // trigger date-picker update
      // eslint-disable-next-line no-self-assign
      this.receivedAtDate = this.receivedAtDate;
    }
  }

  initValidation() {
    this.validators = new ValidatorSet({
      receivedAtDate: new Validator(() => isPresent(this.receivedAtDate)),
    });
  }
}
