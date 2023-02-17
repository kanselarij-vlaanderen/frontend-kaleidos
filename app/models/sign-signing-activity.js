import Model, { attr, belongsTo } from '@ember-data/model';

export default class SignSigningActivityModel extends Model {
  @attr title;
  @attr('datetime') startDate;
  @attr('datetime') endDate;

  @belongsTo('sign-subcase') signSubcase;
  @belongsTo('sign-preparation-activity') signPreparationActivity;
  @belongsTo('sign-refusal-activity') signRefusalActivity;
  @belongsTo('sign-completion-activity') signCompletionActivity;
  @belongsTo('mandatee') mandatee;
}
