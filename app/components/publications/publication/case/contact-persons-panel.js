import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

/**
 * @argument {PublicationFlow} publicationFlow include: contact-persons,contact-persons.person
 */
export default class PublicationsPublicationCaseContactPersonsPanelComponent extends Component {
  @service store;

  @tracked isOpenEditModal = false;
  @tracked contactPersons;

  constructor() {
    super(...arguments);

    this.updateContactPersons();
  }

  @action
  openEditModal() {
    this.isOpenEditModal = true;
  }

  @action
  closeEditModal() {
    this.isOpenEditModal = false;
  }

  @action
  async save(contactPersonProperties) {
    const {
      firstName,
      lastName,
      email,
      organization,
    } = contactPersonProperties;

    if (organization?.isNew) {
      await organization.save();
    }

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

    this.updateContactPersons();
    this.isOpenEditModal = false;
  }

  @action
  async delete(contactPerson) {
    const publicationFlow = this.args.publicationFlow;
    publicationFlow.contactPersons.removeObject(contactPerson);
    this.updateContactPersons();
    const person = await contactPerson.person;
    const destroyContactPerson = contactPerson.destroyRecord();
    const destroyPerson = person.destroyRecord();
    await Promise.all([destroyContactPerson, destroyPerson]);
  }

  updateContactPersons() {
    this.contactPersons = this.args.publicationFlow.contactPersons.toArray();
    // .get() because await is not supported by sort
    this.contactPersons.sort((cp1, cp2) => (cp1.get('person').get('lastName') < cp2.get('person').get('lastName') ? -1 : 1));
  }
}
