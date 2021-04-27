import Model, {
  attr, belongsTo, hasMany
} from '@ember-data/model';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import CONFIG from 'frontend-kaleidos/utils/config';

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
    return this.publicationService.getPublicationCounts(this.id).then((totals) => {
      const openVertalingen = this.publicationService.getPublicationCountsPerTypePerStatus(totals, CONFIG.ACTIVITY_TYPES.vertalen.url, CONFIG.ACTIVITY_STATUSSES.open.url);
      const closedVertalingen = this.publicationService.getPublicationCountsPerTypePerStatus(totals, CONFIG.ACTIVITY_TYPES.vertalen.url, CONFIG.ACTIVITY_STATUSSES.closed.url);
      const withdrawnVertalingen = this.publicationService.getPublicationCountsPerTypePerStatus(totals, CONFIG.ACTIVITY_TYPES.vertalen.url, CONFIG.ACTIVITY_STATUSSES.withdrawn.url);
      const total = openVertalingen + closedVertalingen + withdrawnVertalingen;
      return total;
    });
  }

  get publishpreviewRequestsTotal() {
    return this.publicationService.getPublicationCounts(this.id).then((totals) => {
      const openDrukproeven = this.publicationService.getPublicationCountsPerTypePerStatus(totals, CONFIG.ACTIVITY_TYPES.drukproeven.url, CONFIG.ACTIVITY_STATUSSES.open.url);
      const closedDrukproeven = this.publicationService.getPublicationCountsPerTypePerStatus(totals, CONFIG.ACTIVITY_TYPES.drukproeven.url, CONFIG.ACTIVITY_STATUSSES.closed.url);
      const withdrawnDrukproeven = this.publicationService.getPublicationCountsPerTypePerStatus(totals, CONFIG.ACTIVITY_TYPES.drukproeven.url, CONFIG.ACTIVITY_STATUSSES.withdrawn.url);
      const total = openDrukproeven + closedDrukproeven + withdrawnDrukproeven;
      return total;
    });
  }

  get translationRequestsFinished() {
    return this.publicationService.getPublicationCounts(this.id).then((totals) => {
      const closedVertalingen = this.publicationService.getPublicationCountsPerTypePerStatus(totals, CONFIG.ACTIVITY_TYPES.vertalen.url, CONFIG.ACTIVITY_STATUSSES.closed.url);
      const withdrawnVertalingen = this.publicationService.getPublicationCountsPerTypePerStatus(totals, CONFIG.ACTIVITY_TYPES.vertalen.url, CONFIG.ACTIVITY_STATUSSES.withdrawn.url);
      return closedVertalingen + withdrawnVertalingen;
    });
  }

  get publishpreviewRequestsFinished() {
    return this.publicationService.getPublicationCounts(this.id).then((totals) => {
      const closedDrukproeven = this.publicationService.getPublicationCountsPerTypePerStatus(totals, CONFIG.ACTIVITY_TYPES.drukproeven.url, CONFIG.ACTIVITY_STATUSSES.closed.url);
      const withdrawnDrukproeven = this.publicationService.getPublicationCountsPerTypePerStatus(totals, CONFIG.ACTIVITY_TYPES.drukproeven.url, CONFIG.ACTIVITY_STATUSSES.withdrawn.url);
      return withdrawnDrukproeven + closedDrukproeven;
    });
  }

  get publicationRequestsTotal() {
    return this.publicationService.getPublicationCounts(this.id).then((totals) => {
      const openPublications = this.publicationService.getPublicationCountsPerTypePerStatus(totals, CONFIG.ACTIVITY_TYPES.publiceren.url, CONFIG.ACTIVITY_STATUSSES.open.url);
      const closedPublications = this.publicationService.getPublicationCountsPerTypePerStatus(totals, CONFIG.ACTIVITY_TYPES.publiceren.url, CONFIG.ACTIVITY_STATUSSES.closed.url);
      const withdrawnPublications = this.publicationService.getPublicationCountsPerTypePerStatus(totals, CONFIG.ACTIVITY_TYPES.publiceren.url, CONFIG.ACTIVITY_STATUSSES.withdrawn.url);
      return openPublications + closedPublications + withdrawnPublications;
    });
  }

  get publicationRequestsFinished() {
    return this.publicationService.getPublicationCounts(this.id).then((totals) => {
      const closedPublications = this.publicationService.getPublicationCountsPerTypePerStatus(totals,  CONFIG.ACTIVITY_TYPES.publiceren.url, CONFIG.ACTIVITY_STATUSSES.closed.url);
      const withdrawnPublications = this.publicationService.getPublicationCountsPerTypePerStatus(totals, CONFIG.ACTIVITY_TYPES.publiceren.url, CONFIG.ACTIVITY_STATUSSES.withdrawn.url);
      return closedPublications + withdrawnPublications;
    });
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
