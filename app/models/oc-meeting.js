import DS from 'ember-data';
const { Model, attr, hasMany } = DS;

export default Model.extend({
  startedAt: attr('date'),
  extraInfo: attr('string'),

  agendaItems: hasMany('oc-agendaitem'),
});
