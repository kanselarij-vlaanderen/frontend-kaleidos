import Component from '@glimmer/component';
import { action , get } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { TrackedArray } from 'tracked-built-ins';
import { resource, use } from 'ember-resources';

/**
 * @argument {PublicationFlow} publicationFlow include: contact-persons,contact-persons.person
 */
export default class PublicationsPublicationCaseContactPersonsPanelComponent extends Component {
  @service store;

  @tracked isOpenAddModal = false;

  /* eslint-disable ember/no-get */
  @use contactPersons = resource(() => {
    const contactPersons = new TrackedArray([]);
    const calculateContactPersons = async () => {
      await this.args.publicationFlow.contactPersons;
      const all = await this.store.queryAll('contact-person', {
        'filter[publication-flows][:id:]': this.args.publicationFlow.id,
        include: 'person.organization',
      });
      contactPersons.length = 0;
      all
        .slice()
        .sort((p1, p2) =>
          (get(p1, 'person.lastName') ?? '').localeCompare(get(p2, 'person.lastName') ?? '')
            || (get(p1, 'person.firstName') ?? '').localeCompare(get(p2, 'person.firstName') ?? ''))
        .forEach((p) => contactPersons.push(p));
    };
    calculateContactPersons();
    return contactPersons;
  });
  /* eslint-enable ember/no-get */

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
    const publicationFlow = this.args.publicationFlow;
    let contactPerson = contactPersonProperties.contactPerson;
    if (!contactPerson) {
      let person = contactPersonProperties.person;
      if (!person) {
        person = this.store.createRecord('person', {
          firstName: contactPersonProperties.firstName,
          lastName: contactPersonProperties.lastName,
          organization: contactPersonProperties.organization,
        });
        await person.save();
      }
      contactPerson = this.store.createRecord('contact-person', {
        email: contactPersonProperties.email,
        person: person,
      });
      await contactPerson.save();
    }


    const contactPersons = await publicationFlow.contactPersons;
    contactPersons.push(contactPerson);
    await publicationFlow.save();

    this.isOpenAddModal = false;
  }

  @action
  async unlink(contactPerson) {
    const publicationFlow = this.args.publicationFlow;
    const contactPersons = await publicationFlow.contactPersons;
    const idx = contactPersons.indexOf(contactPerson);
    if (idx >= 0) {
      contactPersons.splice(idx, 1);
    }
    await publicationFlow.save();
  }
}
