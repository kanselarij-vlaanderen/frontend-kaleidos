import Model, { hasMany, belongsTo, attr } from '@ember-data/model';

export default class decisionActivity extends Model {
  @attr('date') startDate; // for publications: displayed as: Datum beslissing

  @belongsTo('agenda-item-treatment') treatment;
  @hasMany('publication-flow') publicationFlows;
}
