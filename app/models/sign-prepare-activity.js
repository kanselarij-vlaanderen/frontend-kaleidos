import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class SignPrepareActivityModel extends Model {
  @attr title;
  @attr('datetime') startDate;
  @attr('datetime') endDate;

  @belongsTo signSubcase;
  @belongsTo signPreparedDocument;
  @belongsTo signMarkActivity;
  @hasMany signActivities;
}
