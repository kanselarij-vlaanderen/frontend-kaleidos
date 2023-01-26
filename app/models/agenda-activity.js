import Model, { hasMany, belongsTo, attr } from '@ember-data/model';

export default class AgendaActivity extends Model {
  @attr('datetime') startDate;

  @belongsTo('subcase', { inverse: 'agendaActivities', async: true }) subcase;

  @hasMany('agendaitem', { inverse: 'agendaActivity', async: true })
  agendaitems;
  @hasMany('submission-activity', { inverse: 'agendaActivity', async: true })
  submissionActivities;
}
