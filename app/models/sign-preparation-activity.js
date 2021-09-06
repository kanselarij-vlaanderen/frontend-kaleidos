import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class SignPreparationActivityModel extends Model {
  @attr title;
  @attr('datetime') startDate;
  @attr('datetime') endDate;

  @belongsTo signSubcase;
  @belongsTo signinghubDocument;
  @belongsTo signMarkingActivity;
  @hasMany signSigningActivities;
}
