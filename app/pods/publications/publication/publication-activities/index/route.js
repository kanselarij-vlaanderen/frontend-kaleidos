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
        'filter[publication-subcase][:id:]': publicationSubcase.id,
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

    const [requestActivities, publicationActivities] = activities.map(
      (activities) => activities.toArray()
    );
    this.requestActivities = requestActivities.sortBy('startDate');
    this.publicationActivities = publicationActivities.sortBy('startDate');

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
    const requestEvents = requestActivities.map(
      (act) => new PublicationRequestEvent(act)
    );
    // publication activities that are pending
    // are not displayed in the timeline
    // but are used for registering a publication
    const publicationEvents = publicationActivities.map(
      (act) => new PublicationPublicationEvent(act)
    );

    return [...requestEvents, ...publicationEvents]
      .sortBy('date', 'timeOrder')
      .reverse();
  }

  afterModel() {
    this.publicationFlow = this.modelFor('publications.publication');
    this.publicationSubcase = this.modelFor(
      'publications.publication.publication-activities'
    );
  }

  setupController(ctrl) {
    super.setupController(...arguments);
    ctrl.publicationFlow = this.publicationFlow;
    ctrl.publicationSubcase = this.publicationSubcase;
    ctrl.requestActivities = this.requestActivities;
    ctrl.publicationActivities = this.publicationActivities;
  }

  @action
  refresh() {
    super.refresh();
  }
}
