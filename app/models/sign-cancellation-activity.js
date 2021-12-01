import Model, { attr, belongsTo } from '@ember-data/model';

export default class SignCancellationActivityModel extends Model {
  @attr title;
  @attr('datetime') startDate;
  @attr('datetime') endDate;

  @belongsTo('sign-subcase') signSubcase;
}
