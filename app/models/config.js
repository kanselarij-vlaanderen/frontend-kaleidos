import Model, { attr } from '@ember-data/model';

export default class ConfigModel extends Model {
  @attr('string') key;
  @attr('string') value;
}
