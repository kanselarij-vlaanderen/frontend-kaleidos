import Model, { attr } from '@ember-data/model';
import CONSTANTS from '../config/constants';

export default class MeetingKindModel extends Model {
  @attr('string') uri;
  @attr('string') label;
  @attr('string') altLabel;
  @attr('number') priority;
  @attr('string') postfix;
  @attr('string') broader;

  get printLabel() {
    // As of writing, the meeting-kind "Elektronische procedure" has an altLabel "Ministerraad via elektronische procedure" which we sometimes need, but for all other meeting kinds we just use the (normal) label
    return this.altLabel ?? this.label ?? '';
  }

  get isAnnexMeeting() {
    return this.broader === CONSTANTS.MEETING_KINDS.ANNEX;
  }
}
