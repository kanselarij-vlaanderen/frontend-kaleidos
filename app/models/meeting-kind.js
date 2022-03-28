import Model, { attr } from '@ember-data/model';

export default class MeetingKindModel extends Model {
  @attr('string') uri;
  @attr('string') label;
  @attr('string') altLabel;
  @attr('string') postfix;
}
