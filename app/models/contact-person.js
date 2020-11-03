import DS from 'ember-data';
import { computed } from '@ember/object';

const {
  Model, attr,
} = DS;

export default Model.extend({
  lastName: attr('string'),
  firstName: attr('string'),
  email: attr('string'),
  phone: attr('string'),
  nameToDisplay: computed('firstName', 'lastName', function() {
    const {
      firstName, lastName,
    } = this;
    return `${firstName} ${lastName}`;
  }),
});
