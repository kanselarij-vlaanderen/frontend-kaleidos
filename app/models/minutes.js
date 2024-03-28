import Piece from './piece';
import { belongsTo, hasMany } from '@ember-data/model';

/**
 * !when adding a new inverse relation (minutes belongsTo/hasMany someModel), make sure to add the polymorphic type {as: 'minutes'}
 * !When setting the relation here or in the other model (someModel belongsTo/hasMany minutes), make sure to add {polymorphic: true}
 * Referencing a relation between minutes and minutes requires both
 */

export default class Minutes extends Piece {
  @belongsTo('meeting', { inverse: 'minutes', async: true, as: 'minutes' })
  minutesForMeeting;
  @hasMany('piece-part', { inverse: 'minutes', async: true, as: 'minutes' }) pieceParts;
}
