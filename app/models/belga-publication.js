import Model, { attr, belongsTo } from '@ember-data/model';

export default class BelgaPublication extends Model {
  @attr('datetime') sentAt;

  @belongsTo('meeting', { inverse: 'belgaPublication', async: true }) meeting;

  get isSent() {
    return !!this.sentAt;
  }
}
