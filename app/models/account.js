import Model, { attr, belongsTo } from '@ember-data/model';

export default class Account extends Model {
  @attr('string') voId;

  @belongsTo('person') user;

  get gebruiker() {
    return this.user;
  }
}
