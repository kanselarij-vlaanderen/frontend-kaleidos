import Model, {
  attr, belongsTo, hasMany
} from '@ember-data/model';

export default class Email extends Model {
  // @attr() messageId;
  @attr('string') to; // dont use email, it will translate to mailto:
  @attr('string') from; // dont use email, it will translate to mailto:
  // @attr('email') cc;
  // @attr('email') bcc;
  @attr('string') subject;
  @attr('string') message;
  // @attr('string') htmlContent; // html-content
  // @attr() isRead;
  // @attr() contentMimeType;
  // @attr('datetime') receivedDate;
  // @attr('datetime') sentDate; Will be set by email-sending-service

  @belongsTo('mail-folder') folder;
  @hasMany('file') attachments;

  @belongsTo('request-activity') requestActivity;
  @belongsTo('cancellation-activity') cancellationActivity;
}
