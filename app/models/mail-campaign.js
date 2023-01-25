import Model, { attr, belongsTo } from '@ember-data/model';

export default class MailCampaign extends Model {
  @attr('string') campaignId;
  @attr('string') campaignWebId;
  @attr('string') archiveUrl;
  @attr('datetime') sentAt;

  @belongsTo('meeting', { inverse: 'mailCampaign', async: true }) meeting;

  get isSent() {
    return !!this.sentAt;
  }
}
