import Model, {
  attr, hasMany
} from '@ember-data/model';

export default class ActivityStatus extends Model {
  @attr('string') uri;
  @attr('string') label;
  @attr('string') scopeNote; // empty in data
  @attr('string') altLabel; // empty in data

  @hasMany('activity') activity;
}
