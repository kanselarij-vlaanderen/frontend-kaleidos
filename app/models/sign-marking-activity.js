import Model, { attr, belongsTo } from '@ember-data/model';

export default class SignMarkingActivityModel extends Model {
  @attr title;
  @attr('datetime') startDate;
  @attr('datetime') endDate;

  @belongsTo signSubcase;
  @belongsTo piece;
  @belongsTo signPreparationActivity;
}
