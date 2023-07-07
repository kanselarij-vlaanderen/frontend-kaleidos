import Component from '@glimmer/component';
import { action, get } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

/**
 * @argument {PublicationFlow} publicationFlow include: contact-persons,contact-persons.person
 */
export default class PublicationsPublicationCaseContactPersonsPanelComponent extends Component {
  @service store;

  @tracked isOpenAddModal = false;

  // eslint-disable ember/no-get
  get contactPersons() {
    return this.args.publicationFlow.contactPersons
               .slice()
               .sort((p1, p2) =>
                 get(p1, 'person.lastName').localeCompare(get(p2, 'person.lastName'))
                   || get(p1, 'person.firstName').localeCompare(get(p2, 'person.firstName')));
  }
  // eslint-enable ember/no-get

  @action
  openAddModal() {
    this.isOpenAddModal = true;
  }

  @action
  closeAddModal() {
    this.isOpenAddModal = false;
  }

  @action
  async save(contactPersonProperties) {
    const {
      firstName,
      lastName,
      email,
      organization,
    } = contactPersonProperties;

    const person = this.store.createRecord('person', {
      firstName: firstName,
      lastName: lastName,
      organization: organization,
    });
    await person.save();

    const publicationFlow = this.args.publicationFlow;
    const contactPerson = this.store.createRecord('contact-person', {
      email: email,
      person: person,
      publicationFlow: publicationFlow,
    });
    await contactPerson.save();

    this.isOpenAddModal = false;
  }

  @action
  async delete(contactPerson) {
    const person = await contactPerson.person;
    await contactPerson.destroyRecord();
    await person.destroyRecord();
  }
}
