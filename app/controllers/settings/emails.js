import Controller from '@ember/controller';
import { action, set, get } from '@ember/object';
import { service } from '@ember/service';
import { isBlank, isEmpty } from '@ember/utils';
import { task } from 'ember-concurrency';
import { EMAIL_VALIDATION_REGEX_MULTIPLE } from 'frontend-kaleidos/config/config';
import {
  ValidatorSet, Validator
} from 'frontend-kaleidos/utils/validators';

export default class SettingsEmailController extends Controller {
  @service router;

  validators;

  constructor() {
    super(...arguments);
    this.initValidators();
  }

  initValidators = () => {
    // Maybe no email should be allowed empty besides the CC ones, but for local and DEV it's fine.
    this.validators = new ValidatorSet({
      translationRequestCcEmail: new Validator(() => this.validateEmail(this.model.translationRequestCcEmail)),
      translationRequestToEmail: new Validator(() => this.validateEmail(this.model.translationRequestToEmail) && !isBlank(this.model.translationRequestToEmail)),
      translationRequestReplyToEmail: new Validator(() => this.validateEmail(this.model.translationRequestReplyToEmail)),
      proofRequestToEmail: new Validator(() => this.validateEmail(this.model.proofRequestToEmail) && !isBlank(this.model.proofRequestToEmail)),
      proofRequestCcEmail: new Validator(() => this.validateEmail(this.model.proofRequestCcEmail)),
      proofRequestReplyToEmail: new Validator(() => this.validateEmail(this.model.proofRequestReplyToEmail)),
      publicationRequestToEmail: new Validator(() => this.validateEmail(this.model.publicationRequestToEmail) && !isBlank(this.model.publicationRequestToEmail)),
      publicationRequestCcEmail: new Validator(() => this.validateEmail(this.model.publicationRequestCcEmail)),
      publicationRequestReplyToEmail: new Validator(() => this.validateEmail(this.model.publicationRequestReplyToEmail)),
      cabinetSubmissionsSecretaryEmail: new Validator(() => this.validateEmail(this.model.cabinetSubmissionsSecretaryEmail) && !isBlank(this.model.cabinetSubmissionsSecretaryEmail)),
      cabinetSubmissionsIkwEmail: new Validator(() => this.validateEmail(this.model.cabinetSubmissionsIkwEmail) && !isBlank(this.model.cabinetSubmissionsIkwEmail)),
      cabinetSubmissionsIkwConfidentialEmail: new Validator(() => this.validateEmail(this.model.cabinetSubmissionsIkwConfidentialEmail) && !isBlank(this.model.cabinetSubmissionsIkwConfidentialEmail)),
      cabinetSubmissionsReplyToEmail: new Validator(() => this.validateEmail(this.model.cabinetSubmissionsReplyToEmail) && !isBlank(this.model.cabinetSubmissionsReplyToEmail)),
    });
  };

  onInputProperty = (property, value) => {
    set(this.model, property, value);
    get(this.validators, property).enableError();
  };

  save = task(async () => {
    if (this.validators.areValid) {
      await this.model.save();
      this.router.transitionTo('settings');
    }
  });

  validateEmail = (emailProp) => {
    const empty = isEmpty(emailProp);
    const valid = EMAIL_VALIDATION_REGEX_MULTIPLE.test(emailProp);
    return empty || valid;
  };

  @action
  cancel() {
    this.model.rollbackAttributes();
    this.router.transitionTo('settings');
  }

  get isDisabled() {
    return (
      !this.validators.areValid ||
      this.save.isRunning
    );
  }
}
