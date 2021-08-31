import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class SignSubcaseModel extends Model {
  @attr title;
  @attr('datetime') startDate;
  @attr('datetime') endDate;

  @belongsTo signFlow;
  @belongsTo signMarkingActivity;
  @belongsTo signPreparationActivity;
  @hasMany signSigningActivities;
  @hasMany signRefusalActivities;
  @belongsTo signCancellationActivity;
  @belongsTo signCompletionActivity;
}
