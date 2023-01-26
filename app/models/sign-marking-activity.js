import Model, { attr, belongsTo } from '@ember-data/model';

export default class SignMarkingActivityModel extends Model {
  @attr title;
  @attr('datetime') startDate;
  @attr('datetime') endDate;

  @belongsTo('sign-subcase', { inverse: 'signMarkingActivity', async: true })
  signSubcase;
  @belongsTo('sign-preparation-activity', {
    inverse: 'signMarkingActivity',
    async: true,
  })
  signPreparationActivity;
  @belongsTo('piece', { inverse: 'signMarkingActivity', async: true }) piece;
}
