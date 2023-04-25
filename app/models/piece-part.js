import Model, { attr, belongsTo } from '@ember-data/model';

export default class PiecePart extends Model {
  @attr('string') title;
  @attr('string') value;
  @attr('datetime') created;

  @belongsTo('report', { inverse: 'pieceParts', async: true }) report;
  @belongsTo('piece-part', { inverse: 'previousPiecePart', async: true })
  nextPiecePart;
  @belongsTo('piece-part', { inverse: 'nextPiecePart', async: true })
  previousPiecePart;
}
