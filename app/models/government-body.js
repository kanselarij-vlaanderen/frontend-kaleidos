import Model, { attr } from '@ember-data/model';

export default class GovernmentBody extends Model {
  @attr() name;
  @attr() uri;
}
