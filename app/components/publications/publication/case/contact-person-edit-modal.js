import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import {
  ValidatorSet, Validator
} from 'frontend-kaleidos/utils/validators';

export default class PublicationsPublicationCaseContactPersonEditModalComponent extends Component {
  @service store;

  @tracked isOpenOrganizationAddModal = false;

  @tracked _organizations;

  @tracked firstName = '';
  @tracked lastName = '';
  @tracked email = '';
  @tracked organization;

  constructor() {
    super(...arguments);
    this.loadOrganizations.perform();
    this.initValidators();
  }

  get organizations() {
    return this._organizations?.sortBy('name');
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
    this._organizations = organizations.filter((org) => org.name);
  }

  @task
  *onSave() {
    const contactPersonProperties = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: isPresent(this.email) ? this.email : undefined,
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
    this._organizations.pushObject(organization);
    this.isOpenOrganizationAddModal = false;
  }

  initValidators() {
    this.validators = new ValidatorSet({
      firstName: new Validator(() => isPresent(this.firstName)),
      lastName: new Validator(() => isPresent(this.lastName)),
    });
  }
}
