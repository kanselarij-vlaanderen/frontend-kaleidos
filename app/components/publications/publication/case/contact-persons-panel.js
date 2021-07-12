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

    this.isOpenEditModal = false;
  }

  @action
  async delete(contactPerson) {
    this.args.publicationFlow.contactPersons.removeObject(contactPerson);
    const person = await contactPerson.person;
    const destroyContactPerson = contactPerson.destroyRecord();
    const destroyPerson = person.destroyRecord();
    await Promise.all([destroyContactPerson, destroyPerson]);
  }
}
