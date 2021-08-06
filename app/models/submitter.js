import Model, { hasMany, attr } from '@ember-data/model';

export default Model.extend({
  label: attr('string'),
  scopeNote: attr('string'),
  altLabel: attr('string'),

  cases: hasMany('case', {
    inverse: null,
  }),
});
