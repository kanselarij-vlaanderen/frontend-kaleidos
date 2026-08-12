import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import {
  Validator, ValidatorSet
} from 'frontend-kaleidos/utils/validators';

export default class PublicationsPublicationCaseContactPersonsPersonAddModalComponent extends Component {
  @service store;

  validators;

  @tracked firstName;
  @tracked lastName;
  @tracked email;

  constructor() {
    super(...arguments);
    this.validators = new ValidatorSet({
      firstName: new Validator(() => isPresent(this.firstName)),
      lastName: new Validator(() => isPresent(this.lastName)),
    });
  }

  save = task(async () => {
    const person = this.store.createRecord('person', {
      firstName: this.firstName,
      lastName: this.lastName,
      organization: this.args.organization,
    });
    await person.save();
    const contactPerson = this.store.createRecord('contact-person', {
      email: isPresent(this.email) ? this.email : undefined,
      person,
    });
    await contactPerson.save();
    await this.args.onSave(person);
  });

  @action
  onInputFirstName(event) {
    this.firstName = event.target.value;
    this.validators.firstName.enableError();
  }

  @action
  onInputLastName(event) {
    this.lastName = event.target.value;
    this.validators.lastName.enableError();
  }
}
