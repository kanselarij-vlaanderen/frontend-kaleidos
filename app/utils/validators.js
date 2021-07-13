import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

// goal: minimize amount of validation functions/getters necessary + streamline validation

export class ValidatorSet {
  constructor(validators) {
    Object.assign(this, validators);
  }

  get areValid() {
    return Object.values(this).every((validator) => validator.isValid);
  }
}

export class Validator {
  @tracked isErrorEnabled;

  constructor(check) {
    this.check = check;
  }

  get isValid() {
    return this.check();
  }

  @action
  enableError() {
    this.isErrorEnabled = true;
  }

  get showError() {
    return this.isErrorEnabled && !this.check();
  }

  get errorClass() {
    if (this.showError) {
      return 'auk-form-group--error';
    }
    return '';
  }
}
