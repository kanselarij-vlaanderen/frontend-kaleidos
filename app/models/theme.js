import Model, { hasMany, attr } from '@ember-data/model';

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
