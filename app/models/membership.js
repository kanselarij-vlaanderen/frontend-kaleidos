import Model, { belongsTo } from '@ember-data/model';

export default class Membership extends Model {
  @belongsTo('user') user;
  @belongsTo('user-organization') organization;
  @belongsTo('role') role;
}
