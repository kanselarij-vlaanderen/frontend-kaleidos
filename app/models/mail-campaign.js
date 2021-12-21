import Model, { attr, hasMany } from '@ember-data/model';

export default class MailCampaign extends Model {
  @attr('string') campaignId;
  @attr('string') campaignWebId;
  @attr('string') archiveUrl;
  @attr('datetime') sentAt;

  @hasMany('meeting', { inverse: null }) meetings;

  get isSent() {
    return !!this.sentAt;
  }
}
