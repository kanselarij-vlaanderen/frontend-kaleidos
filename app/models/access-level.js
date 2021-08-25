import Model, { hasMany, attr } from '@ember-data/model';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes
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
