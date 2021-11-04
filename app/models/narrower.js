import Model, {
  attr
} from '@ember-data/model';
export default class Narrower extends Model {
  @attr('string') label;
  @attr('string') scopeNote;
  @attr('string') altLabel;
}
