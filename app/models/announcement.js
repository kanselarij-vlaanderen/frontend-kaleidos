import DS from 'ember-data';

let { Model, attr, belongsTo } = DS;

export default Model.extend({
  title: attr('string'),
  text: attr('string'),
  created: attr('date'),
  modifiied: attr('date'),
  agenda: belongsTo('agenda'),
});
