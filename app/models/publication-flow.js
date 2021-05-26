import Model, {
  attr, belongsTo, hasMany
} from '@ember-data/model';

export default class PublicationFlow extends Model {
  // Attributes.
  @attr('string') shortTitle;
  @attr('string') longTitle;
  @attr('datetime') translateBefore;
  @attr('datetime') publishBefore;
  @attr('datetime') publishDateRequested;
  @attr('datetime') publishedAt;
  @attr('string') remark;
  @attr('date') closingDate;
  @attr('date') openingDate;
  @attr('datetime') created;
  @attr('datetime') modified;

  // Belongs To.
  @belongsTo('case') case;
  @belongsTo('identification', {
    inverse: 'publicationFlow',
  }) identification;

  @belongsTo('publication-status', {
    inverse: null,
  }) status;

  @belongsTo('publication-mode') mode;
  @belongsTo('regulation-type') regulationType;
  @belongsTo('urgency-level') urgencyLevel;
  @belongsTo('publication-status-change') publicationStatusChange;
  @belongsTo('publication-subcase') publicationSubcase;
  @belongsTo('translation-subcase') translationSubcase;

  // Has many .
  @hasMany('identification', {
    inverse: 'publicationFlowForNumac',
  }) numacNumbers;
  @hasMany('contact-person') contactPersons;
  @hasMany('mandatee') mandatees;
  @hasMany('piece') referenceDocuments;

  get isFromCouncilOfMinisters() {
    return !!this.case.subcase;
  }

  get longTitleOrDefault() {
    return this.isFromCouncilOfMinisters ? this.case.title : this.longTitle;
  }

  get shortTitleOrDefault() {
    return this.isFromCouncilOfMinisters ? this.case.title : this.longTitle;
  }

  get publicationBeforeDateHasExpired() {
    return this.publishBefore
      && this.publishBefore < new Date();
  }

  get publicationDateHasExpired() {
    return this.publishedAt
      && this.publishedAt < new Date();
  }

  get translationDateHasExpired() {
    return this.translateBefore
      && this.translateBefore < new Date();
  }
}
