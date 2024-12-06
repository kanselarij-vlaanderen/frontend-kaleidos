import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isBlank } from '@ember/utils';
import { task } from 'ember-concurrency';
import { EMAIL_VALIDATION_REGEX } from 'frontend-kaleidos/config/config';
import {
  ValidatorSet, Validator
} from 'frontend-kaleidos/utils/validators';

export default class SettingsEmailController extends Controller {
  @service router;
  @service toaster;

  validators;
  
  constructor() {
    super(...arguments);
    this.initValidators();
  }

  initValidators = () => {
    this.validators = new ValidatorSet({
      translationRequestCcEmail: new Validator(() => this.validateEmail(this.model.translationRequestCcEmail)),
      translationRequestToEmail: new Validator(() => this.validateEmail(this.model.translationRequestToEmail)),
      translationRequestReplyToEmail: new Validator(() => this.validateEmail(this.model.translationRequestReplyToEmail)),
      proofRequestToEmail: new Validator(() => this.validateEmail(this.model.proofRequestToEmail)),
      proofRequestCcEmail: new Validator(() => this.validateEmail(this.model.proofRequestCcEmail)),
      proofRequestReplyToEmail: new Validator(() => this.validateEmail(this.model.proofRequestReplyToEmail)),
      publicationRequestToEmail: new Validator(() => this.validateEmail(this.model.publicationRequestToEmail)),
      publicationRequestCcEmail: new Validator(() => this.validateEmail(this.model.publicationRequestCcEmail)),
      publicationRequestReplyToEmail: new Validator(() => this.validateEmail(this.model.publicationRequestReplyToEmail)),
      cabinetSubmissionsSecretaryEmail: new Validator(() => this.validateEmail(this.model.cabinetSubmissionsSecretaryEmail)),
      cabinetSubmissionsIkwEmail: new Validator(() => this.validateEmail(this.model.cabinetSubmissionsIkwEmail)),
      cabinetSubmissionsIkwConfidentialEmail: new Validator(() => this.validateEmail(this.model.cabinetSubmissionsIkwConfidentialEmail)),
      cabinetSubmissionsReplyToEmail: new Validator(() => this.validateEmail(this.model.cabinetSubmissionsReplyToEmail)),
    });
  };

  onInputProperty = (property) => {
   
    // this.model.get(`${property}`) = event.target.value;
    this.validators[`${property}`].enableError();
  };

  @task
  *save() {
    const errors = this.validateAllEmails();
    if (errors.length) {
      errors.map((error) => this.toaster.error(error))
      
    } else {
      yield this.model.save();
      this.router.transitionTo('settings');
    }
  }

  validateAllEmails = () => {
    const propertiesToValidate = [
      'translationRequestCcEmail',
      'translationRequestToEmail',
      'translationRequestReplyToEmail',
      'proofRequestToEmail',
      'proofRequestCcEmail',
      'proofRequestReplyToEmail',
      'publicationRequestToEmail',
      'publicationRequestCcEmail',
      'publicationRequestReplyToEmail',
      'cabinetSubmissionsSecretaryEmail',
      'cabinetSubmissionsIkwEmail',
      'cabinetSubmissionsIkwConfidentialEmail',
      'cabinetSubmissionsReplyToEmail',
    ]
    const allResults = propertiesToValidate.map((prop) => this.validateEmail(this.model.get(`${prop}`)));
    return allResults.filter((result) => !!result);
  };

  validateEmail = (emailProp) => {
    return !!emailProp?.length || EMAIL_VALIDATION_REGEX.test(emailProp);
    // if (emailProp?.length && !EMAIL_VALIDATION_REGEX.test(emailProp)) {
    //   return `${emailProp} is niet aanvaardbaar`;
    // }
  };

  @action
  cancel() {
    this.model.rollbackAttributes();
    this.router.transitionTo('settings');
  }

  get isDisabled() {
    return (
      isBlank(this.model.translationRequestToEmail) ||
      isBlank(this.model.proofRequestToEmail) ||
      isBlank(this.model.publicationRequestToEmail) ||
      this.save.isRunning
    );
  }
}
