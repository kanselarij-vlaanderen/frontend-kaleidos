import DS from 'ember-data';

let { Model, attr, belongsTo  } = DS;

export default Model.extend({
  text: attr("string"),
  approved: attr("boolean"),
  agendaItem: belongsTo('agendaitem')
});
