import Model, {
  attr, hasMany, belongsTo
} from '@ember-data/model';
export default class GovernmentField extends Model {
  @attr('string') label;
  @attr('string') scopeNote;
  @attr('string') altLabel;
  @belongsTo('government-domain') domain;
  @hasMany('ise-code') iseCodes;
  @hasMany('publication-flow') publicationFlows;
}
