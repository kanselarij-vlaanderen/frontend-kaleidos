import DS from 'ember-data';
import { computed } from '@ember/object';

const {
  Model, attr, hasMany, belongsTo,
} = DS;

export default Model.extend({
  lastName: attr('string'),
  alternativeName: attr('string'),
  firstName: attr('string'),

  mandatees: hasMany('mandatee', {
    inverse: null,
  }),
  mandatee: belongsTo('mandatee', {
    inverse: null,
  }),
  signature: belongsTo('signature'),

  fullName: computed('firstName', 'lastName', function() {
    return [this.firstName, this.lastName].filter((str) => !!str).join(' ');
  }),

  nameToDisplay: computed('mandatee', 'alternativeName', 'firstName', 'lastName', function() {
    const {
      alternativeName, firstName, lastName,
    } = this;
    if (alternativeName) {
      return alternativeName;
    } if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    return '';
  }),
});
