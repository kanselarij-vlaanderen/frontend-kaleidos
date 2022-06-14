import Model, { hasMany, belongsTo, attr } from '@ember-data/model';

export default class AgendaItemTreatment extends Model {
  @attr('date') startDate; // for publications: displayed as: Datum beslissing
  @attr('datetime') modified;
  @attr('datetime') created;

  @belongsTo('decision-activity') decisionActivity;
  /*
    *Warning*: The relation to "agendaitem" is one-to-many in frontend, but many-to-many in data.
    Calling this relation will randomly only load 1 of the possible many relations, a save of the model will then delete the other linked agendaitems.
    This belongsTo should only be used to set the agendaitem on initial creation of the model.
    Any reads should be on the inverse "agendaitem.treatments" or with a query via id.
    see method getLatestAgendaitemFromTreatment in publicationService.
  */
  @belongsTo('agendaitem') agendaitem;
  @belongsTo('subcase') subcase;
  @belongsTo('piece') report;
  @belongsTo('newsletter-info', { serialize: false }) newsletterInfo;
  @belongsTo('decision-result-code', { inverse: null }) decisionResultCode;
  @hasMany('publication-flow') publicationFlows;
  @hasMany('sign-flow') signFlows;
}
