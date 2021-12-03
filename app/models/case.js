import Model, { hasMany, attr } from '@ember-data/model';

// TODO: octane-refactor
/* eslint-disable ember/no-get */
// eslint-disable-next-line ember/no-classic-classes
export default Model.extend({
  created: attr('datetime'),
  title: attr('string'),
  shortTitle: attr('string'),
  number: attr('string'),
  isArchived: attr('boolean'),

  publicationFlows: hasMany('publication-flow'),
  subcases: hasMany('subcase'),
  pieces: hasMany('piece'),
  signFlows: hasMany('sign-flow'),
});
