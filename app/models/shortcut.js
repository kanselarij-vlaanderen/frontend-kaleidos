import Model, { attr } from '@ember-data/model';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes
export default Model.extend({
  label: attr('string'),
  description: attr('string'),
  scopeNote: attr('string'),
  type: attr('string'),
});
