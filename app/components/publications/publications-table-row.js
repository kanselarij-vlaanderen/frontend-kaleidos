import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { add } from 'ember-math-helpers/helpers/add';

export default class PublicationsPublicationsTableRowComponent extends Component {
  @service router;
  @service store;
  @service publicationService;

  @tracked publicationDate;
  @tracked pages;
  @tracked proofRequestDate;

  constructor() {
    super(...arguments);

    this.loadData.perform();
  }

  @task
  *loadData() {
    // using queryOne instead of findRecord: findRecord causes included records to be fetched again
    const publicationFlow = yield this.store.queryOne('publication-flow', {
      'filter[:id:]': this.args.publicationFlow.id,
      include: [
        'translation-subcase',

        'translation-subcase.request-activities',
        'translation-subcase.request-activities.used-pieces',

        'publication-subcase',

        'publication-subcase.proofing-activities',

        'publication-subcase.publication-activities',
        'publication-subcase.publication-activities.decisions',
      ].join(','),
    });

    this.pages = yield this.getPageCount(publicationFlow);
    this.proofRequestDate = yield this.getProofRequestDate(publicationFlow);
    this.publicationDate = yield this.publicationService.getPublicationDate(
      publicationFlow
    );
  }

  async getPageCount(publicationFlow) {
    const translationSubcase = await publicationFlow.translationSubcase;
    const requestActivities = await translationSubcase.requestActivities;
    const pieces = (await Promise.all(requestActivities.mapBy('usedPieces')))
      // if not calling to array, Ember seems to skip mapBy
      // flattening an array of request activities
      // probably an Ember Data bug
      .map((pieces) => pieces.toArray())
      .flat();
    const pageCounts = pieces.map((it) => it.pages).compact();
    if (!pageCounts.length) {
      return undefined;
    } else {
      return add(pageCounts);
    }
  }

  async getProofRequestDate(publicationFlow) {
    const publicationSubcase = await publicationFlow.publicationSubcase;
    const proofingActivities = await publicationSubcase.proofingActivities;
    const startDates = proofingActivities.mapBy('startDate');
    startDates.sort();
    const firstProofRequestDate = startDates[0];
    return firstProofRequestDate;
  }

  // getter to only trigger when column is shown
  get isTranslationToLate() {
    let publicationFlow = this.args.publicationFlow;
    return this.publicationService.getIsTranslationToLate(publicationFlow);
  }

  // getter to only trigger when column is shown
  get isPublicationToLate() {
    let publicationFlow = this.args.publicationFlow;
    return this.publicationService.getIsPublicationToLate(publicationFlow);
  }

  @action
  navigateToPublication() {
    this.router.transitionTo(
      'publications.publication',
      this.args.publicationFlow.id
    );
  }
}
