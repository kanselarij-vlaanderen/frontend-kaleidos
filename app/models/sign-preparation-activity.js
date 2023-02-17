import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class SignPreparationActivityModel extends Model {
  @attr title;
  @attr('datetime') startDate;
  @attr('datetime') endDate;

  @belongsTo('sign-subcase') signSubcase;
  @belongsTo('sign-marking-activity') signMarkingActivity;
  @hasMany('sign-signing-activity') signSigningActivities;
}
