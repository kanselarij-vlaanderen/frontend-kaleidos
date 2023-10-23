import Model, { attr, hasMany } from '@ember-data/model';

export default class ParliamentFlow extends Model {
  @attr('date') startDate;
  @attr('date') endDate;

  @hasMany('parliament-submission-activity', { async: true })
  parliamentSubmissionActivity;
}
