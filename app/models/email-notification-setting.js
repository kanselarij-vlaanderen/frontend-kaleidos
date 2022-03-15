import Model, { attr } from '@ember-data/model';

export default class EmailNotificationSetting extends Model {
  @attr('string') defaultFromEmail;

  @attr('string') translationRequestToEmail;
  @attr('string') translationRequestCcEmail;
  @attr('string') proofRequestToEmail;
  @attr('string') proofRequestCcEmail;
  @attr('string') publicationRequestToEmail;
  @attr('string') publicationRequestCcEmail;
}
