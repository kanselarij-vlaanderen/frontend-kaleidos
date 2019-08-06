import DS from 'ember-data';
let { Model, attr, hasMany } = DS;

export default Model.extend({
  identifier: attr('string'),
  agendaItems: hasMany('oc-agendaitem'),
});
