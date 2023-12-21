import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class DecisionmakingFlow extends Model {
  @attr('string') uri;
  // @attr('string') title;
  // @attr('string') shortTitle;
  @attr('datetime') opened;
  @attr('datetime') closed;

  @belongsTo('case', { inverse: 'decisionmakingFlow', async: true }) case;

  @hasMany('concept', { inverse: null, async: true }) governmentAreas;
  @hasMany('subcase', { inverse: 'decisionmakingFlow', async: true }) subcases; // This relation is saved on subcase and should be read-only here
}
