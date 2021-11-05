import Model, {
  attr
} from '@ember-data/model';
export default class Concept extends Model {
  @attr('string') label;
  @attr('string') scopeNote;
  @attr('string') altLabel;
}
