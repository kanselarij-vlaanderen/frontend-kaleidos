import Component from '@glimmer/component';
import { isBlank } from '@ember/utils';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import {
  Validator, ValidatorSet
} from 'frontend-kaleidos/utils/validators';

export default class PublicationsPublicationCaseOrganizationAddModalComponent extends Component {
  @service store;

  validators;
  @tracked name = '';

  constructor() {
    super(...arguments);

    this.initValidators();
  }

  get canSave() {
    return this.validators.areValid;
  }

  @action
  onSave() {
    const organization = this.store.createRecord('organization', {
      name: this.name,
    });
    this.args.onSave(organization);
  }

  initValidators() {
    this.validators = new ValidatorSet({
      name: new Validator(() => !isBlank(this.name)),
    });
  }
}
