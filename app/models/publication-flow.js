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

  // Has many .
  @hasMany('numac-number', {
    inverse: null,
  }) numacNumbers;
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
}
