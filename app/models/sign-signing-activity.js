import Model, { attr, belongsTo } from '@ember-data/model';

export default class SignSigningActivityModel extends Model {
  @attr title;
  @attr('datetime') startDate;
  @attr('datetime') endDate;

  @belongsTo signSubcase;
  @belongsTo signPreparationActivity;
  @belongsTo signRefusalActivity;
  @belongsTo signCompletionActivity;
  @belongsTo mandatee;
}
