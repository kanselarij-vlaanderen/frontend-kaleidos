import Model, { hasMany, belongsTo, attr } from '@ember-data/model';

// TODO: octane-refactor
/* eslint-disable ember/no-get */
// eslint-disable-next-line ember/no-classic-classes
export default Model.extend({
  startDate: attr('datetime'),
  subcase: belongsTo('subcase'),
  agendaitems: hasMany('agendaitems'), // TODO ember-data model name should be singular?
  submissionActivities: hasMany('submission-activity'),
});
