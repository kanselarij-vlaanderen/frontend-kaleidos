import Model, { hasMany, belongsTo, attr } from '@ember-data/model';

export default class AgendaItemTreatment extends Model {
  @attr('date') startDate; // for publications: displayed as: Datum beslissing
  @attr('datetime') modified;
  @attr('datetime') created;

  @belongsTo('agendaitem') agendaitem;
  @belongsTo('subcase') subcase;
  @belongsTo('piece') report;
  @belongsTo('newsletter-info') newsletterInfo;
  @belongsTo('decision-result-code', { inverse: null }) decisionResultCode;
  @hasMany('publication-flow') publicationFlows;
  @hasMany('sign-flow') signFlows;
}
