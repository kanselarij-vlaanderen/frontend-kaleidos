import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { inject as service } from '@ember/service';

export default class AgendaItemTreatment extends Model {
  @service intl;

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
