import Model, { attr, belongsTo } from '@ember-data/model';

export default class Account extends Model {
  @attr('string') name;
  @attr('string') provider;

  @belongsTo('user') user;
}
