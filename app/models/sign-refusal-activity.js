import Model, { attr, belongsTo } from '@ember-data/model';

export default class SignRefusalActivityModel extends Model {
  @attr title;
  @attr('datetime') startDate;
  @attr('datetime') endDate;

  @belongsTo('sign-subcase', {
    inverse: 'signRefusalActivities',
    async: true,
  })
  signSubcase;
  @belongsTo('sign-signing-activity', {
    inverse: 'signRefusalActivity',
    async: true,
  })
  signSigningActivity;
  @belongsTo('sign-approval-activity', {
    inverse: 'signRefusalActivity',
    async: true,
  })
  signApprovalActivity;
}
