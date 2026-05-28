import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { timeout, task } from 'ember-concurrency';
import {
  ValidatorSet, Validator
} from 'frontend-kaleidos/utils/validators';
const NO_ORGANIZATION = Object.freeze({ isNoOrganization: true });

function personNameKey(person) {
  return `${(person.firstName ?? '').trim().toLowerCase()}|${(person.lastName ?? '').trim().toLowerCase()}`;
}

export default class PublicationsPublicationCaseContactPersonAddModalComponent extends Component {
  @service store;
  @service intl;
  @service toaster;

  @tracked isOpenOrganizationAddModal = false;

  @tracked organizations;
  @tracked persons = [];

  @tracked firstName;
  @tracked lastName;
  @tracked email;
  @tracked organizationSelection;
  @tracked selectedPerson;
  @tracked isCreatingNewPerson = false;

  NO_ORGANIZATION = NO_ORGANIZATION;

  get organization() {
    return this.organizationSelection?.isNoOrganization ? null : this.organizationSelection;
  }

  get hasOrganizationSelection() {
    return isPresent(this.organizationSelection);
  }

  constructor() {
    super(...arguments);

    this.validators = new ValidatorSet({
      person: new Validator(() =>
        isPresent(this.selectedPerson)
          || (this.isCreatingNewPerson && isPresent(this.firstName) && isPresent(this.lastName))
      ),
    });
    this.organizations = this.loadOrganizations('');
    this.setOrganization(NO_ORGANIZATION);
  }

  @task
  *searchOrganizations(searchTerm) {
    yield timeout(300);
    return this.loadOrganizations(searchTerm);
  }

  @task
  *searchPersons(searchTerm) {
    yield timeout(300);
    return this.loadPersons(searchTerm);
  }

  @task
  *save() {
    let contactPersonProperties;
    if (this.selectedPerson) {
      const existingContactPerson = yield this.selectedPerson.contactPerson;
      contactPersonProperties = {
        contactPerson: existingContactPerson,
      };
    } else {
      contactPersonProperties = {
        firstName: this.firstName,
        lastName: this.lastName,
        email: isPresent(this.email) ? this.email : undefined,
        organization: this.organization,
      };
    }
    yield this.args.onSave(contactPersonProperties);
  }

  @action
  onInputFirstName(event) {
    this.firstName = event.target.value;
    this.validators.person.enableError();
  }

  @action
  onInputLastName(event) {
    this.lastName = event.target.value;
    this.validators.person.enableError();
  }

  @action
  async setOrganization(selection) {
    this.organizationSelection = selection;
    this.selectedPerson = undefined;
    this.isCreatingNewPerson = false;
    this.firstName = undefined;
    this.lastName = undefined;
    this.email = undefined;
    this.persons = await this.loadPersons();
  }

  @action
  selectPerson(person) {
    this.selectedPerson = person;
    this.isCreatingNewPerson = false;
    this.validators.person.enableError();
  }

  @action
  startCreatingNewPerson() {
    this.selectedPerson = undefined;
    this.isCreatingNewPerson = true;
  }

  @action
  cancelCreatingNewPerson() {
    this.isCreatingNewPerson = false;
    this.firstName = undefined;
    this.lastName = undefined;
    this.email = undefined;
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
  async addOrganization(organization) {
    const name = organization.name;
    const existingOrganizations = await this.loadOrganizations(name);
    const normalized = name?.trim().toLowerCase();
    const duplicate = existingOrganizations.find(
      (o) => o.id !== organization.id && o.name?.trim().toLowerCase() === normalized
    );
    if (duplicate) {
      organization.rollbackAttributes();
      this.toaster.error(
        this.intl.t('organization-with-same-name-exists'),
        this.intl.t('warning-title')
      );
      return;
    }
    await organization.save();
    this.setOrganization(organization);
    this.isOpenOrganizationAddModal = false;
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
      'page[size]': 40,
      sort: 'name',
    });
    if (searchTerm) {
      return organizations;
    }
    return [NO_ORGANIZATION, ...organizations.slice()];
  }

  async loadPersons(searchTerm) {
    if (!this.organizationSelection) {
      return [];
    }
    const baseQuery = {
      'page[size]': 40,
      sort: 'last-name,first-name',
      include: 'contact-person',
    };
    if (this.organizationSelection.isNoOrganization) {
      baseQuery['filter[:has-no:organization]'] = 'yes';
    } else {
      baseQuery['filter[organization][:id:]'] = this.organizationSelection.id;
    }
    let persons;
    if (searchTerm) {
      const [byLast, byFirst] = await Promise.all([
        this.store.query('person', { ...baseQuery, 'filter[last-name]': searchTerm }),
        this.store.query('person', { ...baseQuery, 'filter[first-name]': searchTerm }),
      ]);
      const seen = new Set();
      persons = [];
      for (const p of [...byLast.slice(), ...byFirst.slice()]) {
        if (!seen.has(p.id)) {
          seen.add(p.id);
          persons.push(p);
        }
      }
    } else {
      persons = (await this.store.query('person', baseQuery)).slice();
    }
    const linkedContactPersons = (await this.args.publicationFlow?.contactPersons) ?? [];
    const linkedContactPersonIds = new Set(linkedContactPersons.map((cp) => cp.id));
    const linkedNameKeys = new Set();
    for (const cp of linkedContactPersons) {
      const person = await cp.person;
      if (person) {
        linkedNameKeys.add(personNameKey(person));
      }
    }
    return persons.slice().filter((person) => {
      const contactPersonId = person.belongsTo('contactPerson').id();
      if (!contactPersonId) return false;
      if (linkedContactPersonIds.has(contactPersonId)) return false;
      if (linkedNameKeys.has(personNameKey(person))) return false;
      return true;
    });
  }
}
