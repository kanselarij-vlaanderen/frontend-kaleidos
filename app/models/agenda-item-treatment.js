import Model, { hasMany, belongsTo, attr } from '@ember-data/model';

export default class AgendaItemTreatment extends Model {
  @attr('datetime') modified;
  @attr('datetime') created;

  @belongsTo('decision-activity', { inverse: 'treatment', async: true })
  decisionActivity;
  @belongsTo('news-item', { inverse: 'agendaItemTreatment', async: true })
  newsItem;

  // Merely one-to-many because agenda-item can have different versions (one per agenda-version)
  @hasMany('agendaitem', { inverse: 'treatment', async: true }) agendaitems;
}
