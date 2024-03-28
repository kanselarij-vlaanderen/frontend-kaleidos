import Model, { attr, belongsTo } from '@ember-data/model';

export default class PiecePart extends Model {
  @attr title;
  @attr htmlContent;
  @attr('datetime') created;

  @belongsTo('report', { inverse: 'pieceParts', async: true, polymorphic: true }) report;
  @belongsTo('minutes', { inverse: 'pieceParts', async: true, polymorphic: true }) minutes;
  @belongsTo('piece-part', { inverse: 'previousPiecePart', async: true })
  nextPiecePart;
  @belongsTo('piece-part', { inverse: 'nextPiecePart', async: true })
  previousPiecePart;
}
