import DS from 'ember-data';

const { Model, attr } = DS;

export default Model.extend({
  label: attr('string'),
  scopeNote: attr('string'),
  deprecated: attr('boolean')
});
