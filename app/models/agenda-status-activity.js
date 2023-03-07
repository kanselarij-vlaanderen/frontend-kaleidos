import Model, { attr, belongsTo } from '@ember-data/model';

export default class AgendaStatusActivity extends Model {
  @attr('datetime') approved;

  @belongsTo('agenda', { inverse: 'agendastatusactivities', async: true}) agenda;

}