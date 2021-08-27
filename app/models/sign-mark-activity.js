import Model, { attr, belongsTo } from '@ember-data/model';

export default class SignMarkActivityModel extends Model {
  @attr title;
  @attr('datetime') startDate;
  @attr('datetime') endDate;

  @belongsTo signSubcase;
  @belongsTo piece;
  @belongsTo signPrepareActivity;
}
