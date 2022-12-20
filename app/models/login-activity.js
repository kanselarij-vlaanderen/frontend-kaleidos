import Model, { belongsTo, attr } from '@ember-data/model';

export default class LoginActivity extends Model {
  @attr('datetime') startDate;

  @belongsTo('user', { inverse: 'loginActivity', async: true }) user;
}
