import Model, {
  attr, belongsTo, hasMany
} from '@ember-data/model';

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

  @belongsTo('case') case;
  @belongsTo('identification', {
    inverse: 'publicationFlow',
  }) identification;
  @belongsTo('publication-status') status;
  @belongsTo('publication-mode') mode;
  @belongsTo('regulation-type') regulationType;
  @belongsTo('urgency-level') urgencyLevel;
  // This relation is read-only for concurrency reasons, the linked model is deleted/replaced often
  // Allowing this relation to serialize with a deleted model results in errors
  @belongsTo('publication-status-change', {
    serialize: false,
  }) publicationStatusChange;
  @belongsTo('publication-subcase') publicationSubcase;
  @belongsTo('translation-subcase') translationSubcase;
  @belongsTo('decision-activity') decisionActivity;

  @hasMany('identification', {
    inverse: 'publicationFlowForNumac',
  }) numacNumbers;
  @hasMany('contact-person') contactPersons;
  @hasMany('mandatee', {
    serialize: true,
  }) mandatees;
  @hasMany('piece') referenceDocuments;
  @hasMany('concept') governmentAreas;
}
