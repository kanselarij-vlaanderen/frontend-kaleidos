import Model, {
  attr, hasMany
} from '@ember-data/model';
export default class GovernmentDomain extends Model {
  @attr('string') label;
  @attr('string') scopeNote;
  @attr('string') altLabel;
  @hasMany('government-field') governmentFields;
}
