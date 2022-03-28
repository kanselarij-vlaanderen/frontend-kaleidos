import Model, { attr } from '@ember-data/model';
import CONSTANTS from '../config/constants';

export default class MeetingKindModel extends Model {
  @attr('string') uri;
  @attr('string') label;
  @attr('string') altLabel;
  @attr('string') postfix;
  @attr('string') broader;

  get isAnnexMeeting() {
    return this.broader === CONSTANTS.MEETING_KINDS.ANNEX;
  }
}
