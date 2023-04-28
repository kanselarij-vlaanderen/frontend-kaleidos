import Model, { attr, belongsTo } from '@ember-data/model';

export default class SignApprovalActivity extends Model {
  @attr title;
  @attr approver;
  @attr('datetime') startDate;
  @attr('datetime') endDate;

  @belongsTo('sign-subcase', { inverse: 'signApprovalActivities', async: true })
  signSubcase;
  @belongsTo('sign-preparation-activity', {
    inverse: 'signApprovalActivities',
    async: true,
  })
  signPreparationActivity;
  @belongsTo('sign-refusal-activity', {
    inverse: 'signApprovalActivity',
    async: true,
  })
  signRefusalActivity;
}
