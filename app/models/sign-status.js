import Model, { attr, hasMany } from '@ember-data/model';

export default class SignStatusModel extends Model {
  @attr label;
  @attr position;

  @hasMany signFlows;
}
