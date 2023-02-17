import Model, {
  attr,
  hasMany
} from '@ember-data/model';

export default class Organization extends Model {
  @attr('string') name;
  @attr('string') identifier;

  // Has many .
  @hasMany('person') persons;
}
