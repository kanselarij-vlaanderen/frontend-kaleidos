import DS from 'ember-data';

const {
  Model, attr, hasMany, belongsTo,
} = DS;

export default Model.extend({
  label: attr('string'),
  scopeNote: attr('string'),
  priority: attr('number'),
  altLabel: attr('string'),

  documentContainers: hasMany('document-container', {
    inverse: null,
  }),
  publicationFlows: hasMany('publication-flow', {
    inverse: null,
  }),
  subtypes: hasMany('document-type', {
    inverse: null,
  }),
  superType: belongsTo('document-type', {
    inverse: null,
  }),
});
