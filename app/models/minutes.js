import Piece from './piece';
import { attr, belongsTo } from '@ember-data/model';

export default class Minutes extends Piece {
  @attr value;
  @belongsTo('meeting', { inverse: 'minutes', async: true })
  isMinutesForMeeting;
}
