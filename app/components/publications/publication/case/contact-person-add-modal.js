import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { timeout } from 'ember-concurrency';
import { task } from 'ember-concurrency-decorators';
import {
  ValidatorSet, Validator
} from 'frontend-kaleidos/utils/validators';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';

export default class PublicationsPublicationCaseContactPersonAddModalComponent extends Component {
  @service store;

  @tracked isOpenOrganizationAddModal = false;

  @tracked organizations;

  @tracked firstName = '';
  @tracked lastName = '';
  @tracked email = '';
  @tracked organization;

  constructor() {
    super(...arguments);

    this.initValidators();
    this.initOrganizations();
  }

  @task
  *searchOrganizations(searchTerm) {
    yield timeout(300);
    return this.loadOrganizations.perform(searchTerm);
  }

  @task
  *loadOrganizations(searchTerm) {
    const query = {};
    if (searchTerm) {
      query['filter[name]'] = searchTerm;
    } else {
      // TODO This is not ideal, there are currently +- 60 organizations that come from ACM-IDM, they don't have a name
      // TODO need a better filter, add a boolean to model maybe ?
      query['filter[:gt:name]'] = ''; // workaround to filter on resources that have a 'name' attribute
    }
    const organizations = yield this.store.query('organization', {
      ...query,
      'page[size]': PAGE_SIZE.SELECT,
      sort: 'name',
    });
    return organizations;
  }

  @task
  *save() {
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
    this.isOpenOrganizationAddModal = false;
  }

  async initOrganizations() {
    this.organizations = await this.loadOrganizations.perform('');
  }

  initValidators() {
    this.validators = new ValidatorSet({
      firstName: new Validator(() => isPresent(this.firstName)),
      lastName: new Validator(() => isPresent(this.lastName)),
    });
  }
}
