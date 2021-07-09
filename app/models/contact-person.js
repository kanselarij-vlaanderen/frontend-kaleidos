import Model, {
  attr,
  belongsTo
} from '@ember-data/model';

export default class ContactPerson extends Model {
  @attr('string') email;
  @attr('string') telephone;

  @belongsTo('person') person;
}
