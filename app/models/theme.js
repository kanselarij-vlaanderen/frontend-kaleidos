import DS from 'ember-data';

const { Model, attr, hasMany } = DS;

export default Model.extend({
  label: attr('string'),
  scopeNote: attr('string'),
  subcase: hasMany('subcase', { inverse: null }),
  agendaitem: hasMany('subcase', { inverse: null })
});
