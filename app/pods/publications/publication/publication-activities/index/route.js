import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import {
  PublicationRequestEvent,
  PublicationPublicationEvent,
} from './controller';

/* eslint-disable no-unused-vars */
import RequestActivity from '../../../../../models/request-activity';
import PublicationActivity from '../../../../../models/publication-activity';
/* eslint-enable no-unused-vars */

export default class PublicationsPublicationPublicationActivitiesIndexRoute extends Route {
  @service store;

  async model() {
    const publicationSubcase = this.modelFor(
      'publications.publication.publication-activities'
    );

    const activities = await Promise.all([
      this.store.query('request-activity', {
        'filter[subcase][:id:]': publicationSubcase.id,
        // eslint-disable-next-line prettier/prettier
        include: [
          'email',

          'used-pieces',
          'used-pieces.file'
        ].join(','),
      }),
      this.store.query('publication-activity', {
        'filter[subcase][:id:]': publicationSubcase.id,
        // eslint-disable-next-line prettier/prettier
        include: [
          'decisions',
        ].join(','),
      }),
    ]);

    const [requestActivities, publicationActivities] = activities.map(Array.of);
    const timeline = this.createTimeline(
      requestActivities,
      publicationActivities
    );
    return timeline;
  }

  /**
   * @param {RequestActivity[]} requestActivities
   * @param {PublicationActivity[]} publicationActivities
   * @private
   */
  createTimeline(requestActivities, publicationActivities) {
    let publicationTimeline = [
      ...requestActivities.map((act) => new PublicationRequestEvent(act)),
      ...publicationActivities.map((act) => new PublicationPublicationEvent(act)), // eslint-disable-line prettier/prettier
    ];
    publicationTimeline = publicationTimeline.sortBy('date').reverse();
    return publicationTimeline;
  }

  afterModel() {
    this.publicationFlow = this.modelFor('publications.publication');
  }

  setupController(ctrl) {
    ctrl.publicationFlow = this.publicationFlow;
  }

  @action
  refresh() {
    super.refresh();
  }
}
