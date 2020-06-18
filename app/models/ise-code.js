import DS from 'ember-data';
import { computed } from '@ember/object';

const {
  Model, attr, belongsTo, hasMany,
} = DS;

export default Model.extend({
  name: attr('string'),
  code: attr('string'),
  field: belongsTo('government-field', { inverse: null }),
  mandatees: hasMany('mandatee', { inverse: null }),
  subcase: hasMany('subcase', { inverse: null }),

  nameToShow: computed('name', 'code', function () {
    return `${this.name} - ${this.code}`;
  }),
});
