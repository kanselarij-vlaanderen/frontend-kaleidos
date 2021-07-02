import DS from 'ember-data';

const {
  Model, attr,
} = DS;

export default Model.extend({
  uri: attr('string'),
  label: attr('string'),
  scopeNote: attr('string'),
  deprecated: attr('boolean'),
});
