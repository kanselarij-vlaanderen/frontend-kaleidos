import Model, { attr } from '@ember-data/model';

export default class Language extends Model {
  @attr('string') name;
  @attr('number') priority;
}
