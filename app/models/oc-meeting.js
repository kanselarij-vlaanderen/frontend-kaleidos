import DS from 'ember-data';
let { Model, attr, hasMany } = DS;

export default Model.extend({
  startedAt: attr('date'),
  agendaItems: hasMany('oc-agendaitem'),

});
