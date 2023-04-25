import Model, { attr, belongsTo } from '@ember-data/model';

export default class AgendaStatusActivity extends Model {
  @attr('datetime') startDate;

  @belongsTo('agendastatus', { inverse: null, async: true}) statusSet;
  @belongsTo('agenda', { inverse: 'agendaStatusActivities', async: true}) agenda;

}