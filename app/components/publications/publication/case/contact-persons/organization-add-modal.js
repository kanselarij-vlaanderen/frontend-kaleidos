import Component from '@glimmer/component';
import { action } from '@ember/object';
import { isPresent } from '@ember/utils';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import {
  Validator, ValidatorSet
} from 'frontend-kaleidos/utils/validators';

export default class PublicationsPublicationCaseOrganizationAddModalComponent extends Component {
  @service store;

  validators;

  @tracked name;
  @tracked identifier;

  constructor() {
    super(...arguments);

    this.initValidators();
  }

  @task
  *save() {
    const organization = this.store.createRecord('organization', {
      name: this.name,
      identifier: isPresent(this.identifier) ? this.identifier : undefined,
    });
    yield organization.save();
    this.args.onSave(organization);
  }

  initValidators() {
    this.validators = new ValidatorSet({
      name: new Validator(() => isPresent(this.name)),
    });
  }

  @action
  onInputName(event) {
    this.name = event.target.value;
    this.validators.name.enableError();
  }
}
