import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

// Case should be a reserved word, so added "Model"
export default class CaseModel extends Model {
  @attr('datetime') created;
  @attr('string') title;
  @attr('string') shortTitle;
  @attr('string') number;
  @attr('boolean') isArchived;

  @belongsTo('decisionmaking-flow') decisionmakingFlow;

  @hasMany('piece') pieces;
  @hasMany('publication-flow') publicationFlows;
  @hasMany('sign-flow') signFlows;
}
