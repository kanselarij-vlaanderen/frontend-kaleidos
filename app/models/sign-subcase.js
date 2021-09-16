import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class SignSubcaseModel extends Model {
  @attr title;
  @attr('datetime') startDate;
  @attr('datetime') endDate;

  @belongsTo('sign-flow') signFlow;
  @belongsTo('sign-marking-activity') signMarkingActivity;
  @belongsTo('sign-preparation-activity') signPreparationActivity;
  @hasMany('sign-signing-activity') signSigningActivities;
  @hasMany('sign-refusal-activity') signRefusalActivities;
  @belongsTo('sign-cancellation-activity') signCancellationActivity;
  @belongsTo('sign-completion-activity') signCompletionActivity;
}
