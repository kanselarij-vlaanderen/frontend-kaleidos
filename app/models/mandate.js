import Model, { hasMany, belongsTo } from '@ember-data/model';

export default class Mandate extends Model {
  @belongsTo('role', { inverse: 'mandates', async: true }) role;

  @hasMany('mandatee', { inverse: 'mandate', async: true }) mandatee;
}
