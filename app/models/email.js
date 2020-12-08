import Model, {
  attr, belongsTo, hasMany
} from '@ember-data/model';

export default class Email extends Model {
  // @attr() messageId;
  // @attr('email') to;
  // @attr('email') cc;
  // @attr('email') bcc;
  @attr() subject;
  @attr() content;
  @attr() html; // html-content
  // @attr() isRead;
  // @attr() contentMimeType;
  // @attr('datetime') receivedDate;
  // @attr('datetime') sentDate; Will be set by email-sending-service

  @belongsTo('email-folder') type;

  @hasMany('attachments') file;
}
