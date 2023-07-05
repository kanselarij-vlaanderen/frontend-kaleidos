import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class PublicationFlow extends Model {
  @attr('string') shortTitle;
  @attr('string') longTitle;
  @attr('string') remark;
  @attr('date') closingDate;
  @attr('date') openingDate; // displayed as: Datum ontvangst
  @attr('datetime') created;
  @attr('datetime') modified;
  @attr('number') numberOfPages;
  @attr('number') numberOfExtracts; // = aantal uittreksels

  @belongsTo('case', { inverse: 'publicationFlows', async: true }) case;
  @belongsTo('identification', { inverse: 'publicationFlow', async: true })
  identification;
  @belongsTo('publication-status', { inverse: 'publications', async: true })
  status;
  @belongsTo('publication-mode', { inverse: 'publicationFlow', async: true })
  mode;
  @belongsTo('regulation-type', { inverse: 'publicationFlows', async: true })
  regulationType;
  @belongsTo('urgency-level', { inverse: 'publications', async: true })
  urgencyLevel;
  @belongsTo('publication-status-change', {
    inverse: 'publication',
    async: true,
  })
  publicationStatusChange; // This relation is read-only for concurrency reasons, the linked model is deleted/replaced often. Allowing this relation to serialize with a deleted model results in errors
  @belongsTo('publication-subcase', { inverse: 'publicationFlow', async: true })
  publicationSubcase;
  @belongsTo('translation-subcase', { inverse: 'publicationFlow', async: true })
  translationSubcase;
  @belongsTo('decision-activity', { inverse: 'publicationFlows', async: true })
  decisionActivity;
  @belongsTo('identification', { invserse: 'publicationFlowForThreadId', async: true})
  threadId; // Not serialized on pub-flow side to prevent errors when deleting

  @hasMany('identification', {
    inverse: 'publicationFlowForNumac',
    async: true,
  })
  numacNumbers;
  @hasMany('contact-person', { inverse: 'publicationFlow', async: true })
  contactPersons;
  @hasMany('mandatee', { inverse: 'publicationFlows', async: true }) mandatees;
  @hasMany('piece', { inverse: 'publicationFlow', async: true })
  referenceDocuments;
  @hasMany('concept', { inverse: null, async: true }) governmentAreas;
}
