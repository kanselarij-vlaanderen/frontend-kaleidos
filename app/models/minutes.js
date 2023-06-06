import Piece from './piece';
import { belongsTo, hasMany } from '@ember-data/model';

export default class Minutes extends Piece {
  @belongsTo('meeting', { inverse: 'minutes', async: true })
  minutesForMeeting;
  @hasMany('piece-part', { async: true }) pieceParts;
}
