import Model, { attr } from '@ember-data/model';

export default Model.extend({
  uri: attr('string'),
  label: attr('string'),
  scopeNote: attr('string'),
  deprecated: attr('boolean'),
});
