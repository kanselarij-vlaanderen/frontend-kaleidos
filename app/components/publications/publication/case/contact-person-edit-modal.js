import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isBlank } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import {
  ValidatorSet, Validator
} from 'frontend-kaleidos/utils/validators';

export default class PublicationsPublicationCaseContactPersonEditModalComponent extends Component {
  @service store;

  @tracked isOpenOrganizationAddModal = false;

  @tracked organizations;

  @tracked firstName = '';
  @tracked lastName = '';
  @tracked email = '';
  @tracked organization;

  constructor() {
    super(...arguments);
    this.loadOrganizations.perform();
    this.initValidators();
  }

  get isLoading() {
    return this.loadOrganizations.isRunning || this.onSave.isRunning;
  }

  get canCancel() {
    return !this.onSave.isRunning;
  }

  get canSave() {
    return !this.loadOrganizations.isRunning && this.validators.areValid;
  }

  @task
  *loadOrganizations() {
    // TODO This is not ideal, there are currently +- 60 organizations that come from ACM-IDM, they don't have a name
    // TODO need a better filter, add a boolean to model maybe ?
    const organizations = yield this.store.query('organization', {
      page: {
        size: 200,
      },
    });
    this.organizations = organizations.filter((org) => org.name);
  }

  @task
  *onSave() {
    const contactPersonProperties = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email || undefined,
      organization: this.organization,
    };
    yield this.args.onSave(contactPersonProperties);
  }

  @action
  setOrganization(organization) {
    this.organization = organization;
  }

  @action
  openOrganizationAddModal() {
    this.isOpenOrganizationAddModal = true;
  }

  @action
  closeOrganizationAddModal() {
    this.isOpenOrganizationAddModal = false;
  }

  @action
  addOrganization(organization) {
    this.organization = organization;
    this.organizations.pushObject(organization);
    this.isOpenOrganizationAddModal = false;
  }

  initValidators() {
    this.validators = new ValidatorSet({
      firstName: new Validator(() => !isBlank(this.firstName)),
      lastName: new Validator(() => !isBlank(this.lastName)),
    });
  }
}
