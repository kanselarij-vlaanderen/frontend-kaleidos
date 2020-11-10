import Model, { attr } from '@ember-data/model';
import { computed } from '@ember/object';

export default class ContactPerson extends Model {
  @attr('string') lastName;
  @attr('string') firstName;
  @attr('string') email;
  @attr('string') organisationName; // TODO: Misschien organisation model?
  @attr('string') phone;  // TODO: Voorlopig niet in gebuik

  @computed('firstName', 'lastName')
  get nameToDisplay() {
    const {
      firstName, lastName,
    } = this;
    return `${firstName} ${lastName}`;
  }
}
