import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class ParliamentRetrievalActivity extends Model {
  @attr('datetime') startDate;
  @attr('datetime') endDate;
  @attr authorityDomain;
  @attr('string-set', {
    defaultValue: () => [],
  })
  themes;

  @belongsTo('parliament-subcase', {
    inverse: 'parliamentRetrievalActivities',
    async: true
  })
  parliamentSubcase;
  @belongsTo('subcase', {
    inverse: 'parliamentRetrievalActivity',
    async: true,
  })
  generatedSubcase;

  @hasMany('retrieved-piece', { inverse: null, async: true }) retrievedPieces;
}
