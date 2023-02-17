import Model, { hasMany, belongsTo, attr } from '@ember-data/model';

export default class AgendaItemTreatment extends Model {
  @attr('datetime') modified;
  @attr('datetime') created;

  @belongsTo('decision-activity') decisionActivity;
  @belongsTo('news-item', { serialize: false }) newsItem;

  // Merely hasMany because agenda-item can have different versions (one per agenda-version)
  @hasMany('agendaitem', { serialize: false }) agendaitems;
}
