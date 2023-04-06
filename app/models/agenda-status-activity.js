import Model, { attr, belongsTo } from '@ember-data/model';

export default class AgendaStatusActivity extends Model {
  @attr('datetime') startDate;

  @belongsTo('agendastatus') statusSet;
  @belongsTo('agenda', { inverse: 'agendaStatusActivities', async: true}) agenda;

}