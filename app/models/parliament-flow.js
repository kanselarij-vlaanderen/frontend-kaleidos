import Model, { attr, belongsTo } from '@ember-data/model';

export default class ParliamentFlow extends Model {
  @attr parliamentId;
  @attr('datetime') openingDate;
  @attr('datetime') closingDate;

  @belongsTo('parliament-subcase', { async: true }) parliamentSubcase;
  @belongsTo('case', { inverse: 'parliament-flow', async: true }) case;
  @belongsTo('concept', { inverse: null, async: true }) status;
}
