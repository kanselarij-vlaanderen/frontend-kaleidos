import DS from 'ember-data';

const { Model, attr, belongsTo } = DS;

export default Model.extend({
  postponed: attr('boolean'),
  agendaitem: belongsTo('agendaitem'),
  meeting: belongsTo('meeting'),
});
