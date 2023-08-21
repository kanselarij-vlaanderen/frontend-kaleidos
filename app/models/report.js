import Piece from './piece';
import { belongsTo, hasMany } from '@ember-data/model';

export default class Report extends Piece {
  @belongsTo('decision-activity', { inverse: 'report', async: true })
  decisionActivity;
  @hasMany('piece-part', { inverse: 'report', async: true }) pieceParts;
}
