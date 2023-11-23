import Model, { attr, hasMany } from '@ember-data/model';

export default class ParliamentSubcase extends Model {
  @attr('date') startDate;
  @attr('date') endDate;

  @hasMany('parliament-submission-activity', { inverse: null, async: true })
  parliamentSubmissionActivities;
}
