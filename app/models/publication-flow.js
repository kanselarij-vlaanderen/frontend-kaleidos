import ModelWithModifier from 'fe-redpencil/models/model-with-modifier';
import {
  attr, belongsTo, hasMany
} from '@ember-data/model';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import CONFIG from 'fe-redpencil/utils/config';

export default class PublicationFlow extends ModelWithModifier {
  // Attributes.
  @attr('string') publicationNumber;
  @attr('datetime') translateBefore;
  @attr('datetime') publishBefore;
  @attr('datetime') publishedAt;
  @attr('string') numacNumber; // is this only 1 per flow ?
  @attr('string') remark;
  @attr('number') priority;
  @attr('datetime') created;

  // Services.
  @service publicationService;

  // Belongs To.
  @belongsTo('case') case;
  @belongsTo('publication-status', {
    inverse: null,
  }) status;
  @belongsTo('publication-type') type;

  // Has many .
  @hasMany('subcase') subcases;
  @hasMany('contact-person') contactPersons;
  @hasMany('mandatee') mandatees;

  @computed('priority')
  get hasPriority() {
    return this.priority > 0;
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
}
