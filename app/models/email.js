import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class Email extends Model {
  // @attr() messageId;
  @attr('string') to; // dont use email, it will translate to mailto:
  @attr('string') from; // dont use email, it will translate to mailto:
  @attr('string') cc;
  // @attr('string') bcc;
  @attr('string') replyTo;
  @attr('string') subject;
  @attr('string') message;
  // @attr('string') htmlContent; // html-content
  // @attr() isRead;
  // @attr() contentMimeType;
  // @attr('datetime') receivedDate;
  // @attr('datetime') sentDate; Will be set by email-sending-service

  @belongsTo('mail-folder', { inverse: 'emails', async: true }) folder;
  @belongsTo('request-activity', { inverse: 'email', async: true })
  requestActivity;
  @belongsTo('cancellation-activity', { inverse: 'email', async: true })
  cancellationActivity;

  @hasMany('file', { inverse: null, async: true }) attachments;
}
