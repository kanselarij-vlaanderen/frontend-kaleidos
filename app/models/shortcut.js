import Model, { attr } from '@ember-data/model';

export default class Shortcut extends Model {
  @attr label;
  @attr description;
  @attr scopeNote;
  @attr type;
}
