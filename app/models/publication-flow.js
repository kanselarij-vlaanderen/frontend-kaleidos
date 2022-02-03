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

  @belongsTo('case') case;
  @belongsTo('identification', {
    inverse: 'publicationFlow',
  }) identification;
  @belongsTo('publication-status') status;
  @belongsTo('publication-mode') mode;
  @belongsTo('regulation-type') regulationType;
  @belongsTo('urgency-level') urgencyLevel;
  @belongsTo('publication-status-change') publicationStatusChange;
  @belongsTo('publication-subcase') publicationSubcase;
  @belongsTo('translation-subcase') translationSubcase;
  @belongsTo('agenda-item-treatment') agendaItemTreatment;

  @hasMany('identification', {
    inverse: 'publicationFlowForNumac',
  }) numacNumbers;
  @hasMany('contact-person') contactPersons;
  @hasMany('mandatee', {
    serialize: true,
  }) mandatees;
  @hasMany('piece') referenceDocuments;
}
