import Model, { hasMany, attr } from '@ember-data/model';

export default Model.extend({
  label: attr('string'),
  scopeNote: attr('string'),
  mandatees: hasMany('mandatee'),
});
