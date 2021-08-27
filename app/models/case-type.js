import Model, { attr } from '@ember-data/model';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes
export default Model.extend({
  uri: attr('string'),
  label: attr('string'),
  scopeNote: attr('string'),
  deprecated: attr('boolean'),
});
