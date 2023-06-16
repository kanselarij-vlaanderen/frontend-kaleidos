import Piece from './piece';
import { hasMany } from '@ember-data/model';

export default class Report extends Piece {
  @hasMany('piece-part', { inverse: 'report', async: true }) pieceParts;
}
