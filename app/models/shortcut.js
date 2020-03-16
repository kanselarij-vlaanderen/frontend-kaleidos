import DS from 'ember-data';

const { Model, attr } = DS;

export default Model.extend({
  label: attr('string'),
  description: attr('string'),
  scopeNote: attr('string'),
  type: attr('string')
});
