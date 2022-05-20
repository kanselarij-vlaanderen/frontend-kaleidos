import Model, {
  attr, hasMany
} from '@ember-data/model';

export default class GovernmentBody extends Model {
  @attr() name;
  @attr() uri;
}
