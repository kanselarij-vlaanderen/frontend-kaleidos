import Model, { hasMany, belongsTo } from '@ember-data/model';

export default class Mandate extends Model {
  @belongsTo('role') role;
  @hasMany('mandatee') mandatee;
}
