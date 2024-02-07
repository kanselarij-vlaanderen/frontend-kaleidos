import Piece from './piece';
import { belongsTo, hasMany } from '@ember-data/model';

export default class Minutes extends Piece {
  @belongsTo('meeting', { inverse: 'minutes', async: true, as: 'minutes' })
  minutesForMeeting;
  @hasMany('piece-part', { inverse: 'minutes', async: true }) pieceParts;
}
