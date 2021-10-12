import Model, { attr, belongsTo } from '@ember-data/model';

export default class SignRefusalActivityModel extends Model {
  @attr title;
  @attr('datetime') startDate;
  @attr('datetime') endDate;

  @belongsTo('sign-subcase') signSubcase;
  @belongsTo('sign-signing-activity') signSigningActivity;
}
