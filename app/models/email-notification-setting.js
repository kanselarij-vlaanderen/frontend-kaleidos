import Model, { attr } from '@ember-data/model';

export default class EmailNotificationSetting extends Model {
  @attr('string') translationRequestToEmail;
  @attr('string') proofRequestToEmail;
  @attr('string') defaultFromEmail;
}
