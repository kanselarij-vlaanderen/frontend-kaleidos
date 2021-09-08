import Model, { hasMany, attr } from '@ember-data/model';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes
export default Model.extend({
  label: attr('string'),
  scopeNote: attr('string'),
  subcase: hasMany('subcase', {
    inverse: null,
  }),
  agendaitem: hasMany('subcase', {
    inverse: null,
  }),
  deprecated: attr('boolean'),
});
