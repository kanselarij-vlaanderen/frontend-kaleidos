import Model, { hasMany, belongsTo, attr } from '@ember-data/model';

export default class AgendaActivity extends Model {
  @attr('datetime') startDate;
  @belongsTo('subcase') subcase;
  @hasMany('agendaitem') agendaitems;
  @hasMany('submission-activity') submissionActivities;
}
