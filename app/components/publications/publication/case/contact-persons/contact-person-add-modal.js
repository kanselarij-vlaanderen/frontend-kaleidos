import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { timeout, task } from 'ember-concurrency';
import {
  ValidatorSet, Validator
} from 'frontend-kaleidos/utils/validators';
import { LIVE_SEARCH_DEBOUNCE_TIME, PAGE_SIZE } from 'frontend-kaleidos/config/config';
const NO_ORGANIZATION = Object.freeze({ isNoOrganization: true });

function personNameKey(person) {
  return `${(person.firstName ?? '').trim().toLowerCase()}|${(person.lastName ?? '').trim().toLowerCase()}`;
}

export default class PublicationsPublicationCaseContactPersonAddModalComponent extends Component {
  @service store;

  @tracked isOpenOrganizationAddModal = false;
  @tracked isOpenPersonAddModal = false;

  @tracked organizations;
  @tracked persons = [];

  @tracked selectedOrganization;
  @tracked selectedPerson;

  constructor() {
    super(...arguments);

    this.validators = new ValidatorSet({
      person: new Validator(() => isPresent(this.selectedPerson)),
    });
    this.organizations = this.loadOrganizations();
    this.selectOrganization(NO_ORGANIZATION);
  }

  get organization() {
    return this.selectedOrganization?.isNoOrganization ? null : this.selectedOrganization;
  }

  searchOrganizations = task(async (searchTerm) => {
    await timeout(LIVE_SEARCH_DEBOUNCE_TIME);
    return this.loadOrganizations(searchTerm);
  });

  searchPersons = task(async (searchTerm) => {
    await timeout(LIVE_SEARCH_DEBOUNCE_TIME);
    return this.loadPersons(searchTerm);
  });

  save = task(async () => {
    const existingContactPerson = await this.selectedPerson.contactPerson;
    await this.args.onSave({
      contactPerson: existingContactPerson,
    });
  });

  @action
  async selectOrganization(selection) {
    this.selectedOrganization = selection;
    this.selectedPerson = undefined;
    this.persons = await this.loadPersons();
  }

  @action
  selectPerson(person) {
    this.selectedPerson = person;
    this.validators.person.enableError();
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
    this.selectOrganization(organization);
    this.isOpenOrganizationAddModal = false;
  }

  @action
  openPersonAddModal() {
    this.isOpenPersonAddModal = true;
  }

  @action
  closePersonAddModal() {
    this.isOpenPersonAddModal = false;
  }

  @action
  async addPerson(person) {
    this.selectPerson(person);
    this.isOpenPersonAddModal = false;
    // Refresh the persons dropdown so the newly-created person is visible
    this.persons = await this.loadPersons();
  }

  async loadOrganizations(searchTerm) {
    const query = {};
    if (searchTerm) {
      query['filter[name]'] = searchTerm;
    } else {
      // TODO This is not ideal, there are currently +- 60 organizations that come from ACM-IDM, they don't have a name
      // TODO need a better filter, add a boolean to model maybe ?
      query['filter[:gt:name]'] = ''; // workaround to filter on resources that have a 'name' attribute
    }

    const organizations = await this.store.query('organization', {
      ...query,
      'page[size]': PAGE_SIZE.SELECT,
      sort: 'name',
    });

    if (searchTerm) {
      return organizations;
    } else {
      return [NO_ORGANIZATION, ...organizations.slice()];
    }
  }

  async loadPersons(searchTerm) {
    const query = {
      'page[size]': PAGE_SIZE.PERSONS_OF_ORGANIZATION,
      sort: 'last-name,first-name',
      include: 'contact-person',
      'filter[:has:contact-person]': true,
    };
    if (this.selectedOrganization.isNoOrganization) {
      query['filter[:has-no:organization]'] = 'yes';
    } else {
      query['filter[organization][:id:]'] = this.selectedOrganization.id;
    }
    if (searchTerm) {
      // OR-match on either first-name or last-name so a user typing part of
      // either half of a name finds the person in a single round-trip.
      query['filter[:or:][first-name]'] = searchTerm;
      query['filter[:or:][last-name]'] = searchTerm;
    }
    const persons = (await this.store.query('person', query)).slice();

    const linkedContactPersons = (await this.args.publicationFlow?.contactPersons) ?? [];
    const linkedContactPersonIds = new Set(linkedContactPersons.map((cp) => cp.id));
    const linkedNameKeys = new Set();
    for (const cp of linkedContactPersons) {
      const person = await cp.person;
      if (person) {
        linkedNameKeys.add(personNameKey(person));
      }
    }
    const filtered = [];
    for (const person of persons) {
      const contactPerson = await person.contactPerson;
      if (linkedContactPersonIds.has(contactPerson?.id)) continue;
      if (linkedNameKeys.has(personNameKey(person))) continue;
      filtered.push(person);
    }
    return filtered;
  }
}
