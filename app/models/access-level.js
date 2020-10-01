import DS from 'ember-data';

const {
  attr,
  hasMany,
} = DS;

export default DS.Model.extend({
  label: attr('string'),
  priority: attr('string'),
  altLabel: attr('string'),
  scopeNote: attr('string'),
  subcases: hasMany('subcase', {
    inverse: null,
  }),
  pieces: hasMany('piece', {
    inverse: null,
  }),
  cases: hasMany('case'),
});
