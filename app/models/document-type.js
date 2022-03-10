import Model, { belongsTo, hasMany, attr } from '@ember-data/model';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes
export default Model.extend({
  uri: attr('string'),
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
