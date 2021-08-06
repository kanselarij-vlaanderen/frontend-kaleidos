import Model, { attr } from '@ember-data/model';

export default Model.extend({
  label: attr('string'),
  scopeNote: attr('string'),
});
