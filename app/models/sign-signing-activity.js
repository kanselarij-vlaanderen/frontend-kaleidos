import Model, { attr, belongsTo } from '@ember-data/model';

export default class SignSigningActivityModel extends Model {
  @attr title;
  @attr('datetime') startDate;
  @attr('datetime') endDate;

  @belongsTo('sign-subcase', { inverse: 'signSigningActivities', async: true })
  signSubcase;
  @belongsTo('sign-preparation-activity', {
    inverse: 'signSigningActivities',
    async: true,
  })
  signPreparationActivity;
  @belongsTo('sign-refusal-activity', {
    inverse: 'signSigningActivity',
    async: true,
  })
  signRefusalActivity;
  @belongsTo('sign-completion-activity', {
    inverse: 'signSigningActivities',
    async: true,
  })
  signCompletionActivity;
  @belongsTo('mandatee', { inverse: 'signSigningActivities', async: true })
  mandatee;
}
