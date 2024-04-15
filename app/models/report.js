import Piece from './piece';
import { belongsTo, hasMany } from '@ember-data/model';

/**
 * !when adding a new inverse relation (report belongsTo/hasMany someModel), make sure to add the polymorphic type {as: 'report'}
 * !When setting the relation here or in the other model (someModel belongsTo/hasMany report), make sure to add {polymorphic: true}
 * Referencing a relation between report and report requires both
 */

export default class Report extends Piece {
  @belongsTo('decision-activity', { inverse: 'report', async: true, as: 'report' })
  decisionActivity;
  @hasMany('piece-part', { inverse: 'report', async: true, as: 'report' }) pieceParts;
}
