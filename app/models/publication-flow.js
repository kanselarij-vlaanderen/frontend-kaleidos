import Model, {
  attr, belongsTo, hasMany
} from '@ember-data/model';
import { inject as service } from '@ember/service';

export default class PublicationFlow extends Model {
  // Attributes.
  @attr('datetime') translateBefore;
  @attr('datetime') publishBefore;
  @attr('datetime') publishDateRequested;
  @attr('datetime') publishedAt;
  @attr('string') remark;
  @attr('date') closingDate;
  @attr('date') openingDate;
  @attr('datetime') created;
  @attr('datetime') modified;

  // Services.
  @service publicationService;

  // Belongs To.
  @belongsTo('case') case;
  @belongsTo('identification') identification;

  @belongsTo('publication-status', {
    inverse: null,
  }) status;

  @belongsTo('publication-mode') mode;
  @belongsTo('regulation-type') regulationType;
  @belongsTo('urgency-level') urgencyLevel;
  @belongsTo('publication-status-change') publicationStatusChange;

  // Has many .
  @hasMany('numac-number') numacNumbers;
  @hasMany('subcase') subcases;
  @hasMany('contact-person') contactPersons;
  @hasMany('mandatee') mandatees;

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

  get translationRequestsTotal() {
    // TODO new logic
    return null;
  }

  get publishpreviewRequestsTotal() {
    // TODO new logic
    return null;
  }

  get translationRequestsFinished() {
    // TODO new logic
    return null;
  }

  get publishpreviewRequestsFinished() {
    // TODO new logic
    return null;
  }

  get publicationRequestsTotal() {
    // TODO new logic
    return null;
  }

  get publicationRequestsFinished() {
    // TODO new logic
    return null;
  }
}
