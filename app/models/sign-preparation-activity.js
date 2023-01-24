import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class SignPreparationActivityModel extends Model {
  @attr title;
  @attr('datetime') startDate;
  @attr('datetime') endDate;

  @belongsTo('sign-subcase', { inverse: 'signPreprationActivity', async: true })
  signSubcase;
  @belongsTo('sign-marking-activity', {
    inverse: 'signPreparationActivity',
    async: true,
  })
  signMarkingActivity;

  @hasMany('sign-signing-activity', {
    inverse: 'signPreprationActivity',
    async: true,
  })
  signSigningActivities;
}
