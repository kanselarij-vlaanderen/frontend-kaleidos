import Model, { attr, belongsTo } from '@ember-data/model';

export default class Account extends Model {
  @attr name;
  @attr provider;
  @attr uri;

  @belongsTo('user') user;
}
