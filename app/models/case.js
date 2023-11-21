import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

// Case should be a reserved word, so added "Model"
export default class CaseModel extends Model {
  @attr('datetime') created;
  @attr('string') title;
  @attr('string') shortTitle;
  @attr('string') number;

  @belongsTo('decisionmaking-flow', { inverse: 'case', async: true })
  decisionmakingFlow;
  @belongsTo('parliament-flow', { inverse: 'case', async: true }) parliamentFlow;

  @hasMany('piece', { inverse: 'cases', async: true, polymorphic: true })
  pieces;
  @hasMany('publication-flow', { inverse: 'case', async: true })
  publicationFlows;
  @hasMany('sign-flow', { inverse: 'case', async: true }) signFlows;
}
