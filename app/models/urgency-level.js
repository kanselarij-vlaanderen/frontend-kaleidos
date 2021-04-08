import Model, {
  attr, hasMany
} from '@ember-data/model';

export default class UrgencyLevel extends Model {
  @attr('string') uri;
  @attr('string') name;
  @hasMany('publication-flow') publications;
}
