import DS from 'ember-data';

const { Model, attr, hasMany, belongsTo } = DS;

export default Model.extend({
  label: attr('string'),
  scopeNote: attr('string'),
  publicationStates: hasMany('publication-state'),
  substates: hasMany('publication-state-code'),
  superstate: belongsTo('publication-state-code')
});
