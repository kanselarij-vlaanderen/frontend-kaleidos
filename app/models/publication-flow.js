import Model, {
  attr, belongsTo, hasMany
} from '@ember-data/model';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default class PublicationFlow extends Model {
  // Attributes.
  @attr('number') publicationNumber;
  @attr('string') publicationSuffix;
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

  @computed('publicationNumber,publicationSuffix')
  get publicationNumberToDisplay() {
    if (this.publicationSuffix && this.publicationSuffix !== '') {
      return `${this.publicationNumber} ${this.publicationSuffix}`;
    }
    return `${this.publicationNumber}`;
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

  get latestStatusChange() {
    const statusChanges = this.store.query('publication-status-change', {
      sort: '-startedAt',
      filter: {
        publication: this,
      },
    });
    return statusChanges.get('firstObject');
  }
}
