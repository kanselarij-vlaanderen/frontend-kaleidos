import Model, { attr } from '@ember-data/model';

export default class AlertType extends Model {
  @attr('string') label;
  @attr('string') scopeNote;
}
