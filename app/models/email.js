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
  @attr('string') content;
  // @attr('string') html; // html-content
  // @attr() isRead;
  // @attr() contentMimeType;
  // @attr('datetime') receivedDate;
  // @attr('datetime') sentDate; Will be set by email-sending-service

  @belongsTo('email-folder') folder;

  @hasMany('file') attachments;
}
