import Model, { attr, belongsTo } from '@ember-data/model';

export default class SignRefusalActivityModel extends Model {
  @attr title;
  @attr('datetime') startDate;
  @attr('datetime') endDate;

  @belongsTo signSubcase;
  @belongsTo signSigningActivity;
}
