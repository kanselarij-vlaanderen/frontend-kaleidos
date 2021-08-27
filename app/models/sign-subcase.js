import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class SignSubcaseModel extends Model {
  @attr title;
  @attr('datetime') startDate;
  @attr('datetime') endDate;

  @belongsTo signFlow;
  @belongsTo signMarkActivity;
  @belongsTo signPrepareActivity;
  @hasMany signActivities;
  @hasMany signRefuseActivities;
  @belongsTo signCancellationActivity;
  @belongsTo signCompleteActivity;
}
