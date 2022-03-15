import Model, { attr, hasMany } from '@ember-data/model';

export default class AccountGroup extends Model {
  @attr uri;
  @attr name;

  @hasMany('user') users;
}
