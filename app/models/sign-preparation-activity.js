import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class SignPreparationActivityModel extends Model {
  @attr title;
  @attr('datetime') startDate;
  @attr('datetime') endDate;

  @belongsTo('sign-subcase', { inverse: 'signPreparationActivity', async: true })
  signSubcase;
  @belongsTo('sign-marking-activity', {
    inverse: 'signPreparationActivity',
    async: true,
  })
  signMarkingActivity;

  @hasMany('sign-signing-activity', {
    inverse: 'signPreparationActivity',
    async: true,
  })
  signSigningActivities;
  @hasMany('sign-approval-activity', {
    inverse: 'signPreparationActivity',
    async: true,
  })
  signApprovalActivities;
}
