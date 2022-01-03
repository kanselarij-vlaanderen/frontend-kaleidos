import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { add } from 'ember-math-helpers/helpers/add';

export default class PublicationsPublicationsTableRowComponent extends Component {
  @service router;
  @service store;

  @tracked decision;
  @tracked pages;

  constructor() {
    super(...arguments);

    this.loadData.perform();
  }

  @task
  *loadData() {
    const publicationSubcase = yield this.args.publicationFlow.publicationSubcase;
    this.decision = yield this.store.queryOne('decision', {
      'filter[publication-activity][subcase][:id:]': publicationSubcase.id,
      sort: 'publication-activity.start-date,publication-date',
    });

    const publicationFlow = yield this.store.findRecord('publication-flow', this.args.publicationFlow.id, {
      include: [
        'translation-subcase',

        'translation-subcase.request-activities',
        'translation-subcase.request-activities.used-pieces',
      ].join(',')
    });

    this.pages = yield this.getPageCount(publicationFlow);
  }

  async getPageCount(publicationFlow) {
    const translationSubcase = await publicationFlow.translationSubcase;
    const requestActivities = await translationSubcase.requestActivities;
    const pieces = (await Promise.all(requestActivities.mapBy('usedPieces')))
      // if not calling to array, Ember seems to skip mapBy
      // flattening an array of request activities
      // probably an Ember Data bug
      .map(pieces => pieces.toArray())
      .flat();
    const pageCounts = pieces.map(p => p.pages).compact();
    if (!pageCounts.length) {
      return undefined;
    } else {
      return add(pageCounts);
    }
  }

  @action
  navigateToPublication() {
    this.router.transitionTo('publications.publication', this.args.publicationFlow.id);
  }
}
