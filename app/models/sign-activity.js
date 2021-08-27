import Model, { attr, belongsTo } from '@ember-data/model';

export default class SignActivityModel extends Model {
  @attr title;
  @attr('datetime') startDate;
  @attr('datetime') endDate;

  @belongsTo signSubcase;
  @belongsTo signPrepareActivity;
  @belongsTo signRefuseActivity;
  @belongsTo signCompleteActivity;
  @belongsTo mandatee;
}
