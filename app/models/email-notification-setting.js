import Model, { attr } from '@ember-data/model';

export default class EmailNotificationSetting extends Model {
  @attr('string') defaultFromEmail;

  @attr('string') translationRequestToEmail;
  @attr('string') translationRequestCcEmail;
  @attr('string') translationRequestReplyToEmail;
  @attr('string') proofRequestToEmail;
  @attr('string') proofRequestCcEmail;
  @attr('string') proofRequestReplyToEmail;
  @attr('string') publicationRequestToEmail;
  @attr('string') publicationRequestCcEmail;
  @attr('string') publicationRequestReplyToEmail;
}
