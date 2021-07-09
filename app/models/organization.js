import Model, {
  attr,
  hasMany
} from '@ember-data/model';

export default class Organization extends Model {
  @attr('string') name;
  @attr('datetime') created;
  @attr('datetime') modified;

  // Has many .
  @hasMany('person') persons;
}
