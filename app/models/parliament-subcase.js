import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class ParliamentSubcase extends Model {
  @attr('date') startDate;
  @attr('date') endDate;

  @belongsTo('parliament-flow', { inverse: 'parliamentSubcase', async: true })
  parliamentFlow;

  @hasMany('parliament-submission-activity', { inverse: 'parliamentSubcase', async: true })
  parliamentSubmissionActivities;
  @hasMany('parliament-retrieval-activity', { inverse: 'parliamentSubcase', async: true })
  parliamentRetrievalActivities;
}
