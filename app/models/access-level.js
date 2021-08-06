import Model, { hasMany, attr } from '@ember-data/model';

export default Model.extend({
  uri: attr('string'),
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
