import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class SignCompleteActivityModel extends Model {
  @attr title;
  @attr('datetime') startDate;
  @attr('datetime') endDate;

  @belongsTo signSubcase;
  @hasMany signActivities;
}
