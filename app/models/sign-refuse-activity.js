import Model, { attr, belongsTo } from '@ember-data/model';

export default class SignRefuseActivityModel extends Model {
  @attr title;
  @attr('datetime') startDate;
  @attr('datetime') endDate;

  @belongsTo signSubcase;
  @belongsTo signActivity;
}
