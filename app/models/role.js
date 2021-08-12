import Model, {
  attr, hasMany
} from '@ember-data/model';

export default class Role extends Model {
  @attr() label;
  @hasMany('mandate') mandates;
}
