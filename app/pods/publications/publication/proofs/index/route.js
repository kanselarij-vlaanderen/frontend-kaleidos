import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export class Activity {
  @tracked date;
  @tracked requestActivity;
  @tracked proofingActivity;

  // no async constructor() in JS
  static async create(requestActivity, proofingActivity) {
    const activity = new Activity();
    if (requestActivity) {
      activity.requestActivity = requestActivity;
      activity.date = requestActivity.startDate;
    }
    if (proofingActivity) {
      activity.proofingActivity = proofingActivity;
      activity.date = activity.endDate;
    }
    return activity;
  }
}
export default class PublicationsPublicationProofsRoute extends Route {
  @service store;

  async model() {
    this.publicationSubcase = await this.modelFor(
      'publications.publication.proofs'
    );

    let requestActivities = await this.store.query('request-activity', {
      'filter[publication-subcase][:id:]': this.publicationSubcase.id,
      include: 'email,used-pieces,used-pieces.file',
      sort: '-start-date',
    });

    const proofingActivities = await this.store.query('proofing-activity', {
      'filter[subcase][:id:]': this.publicationSubcase.id,
      include: 'generated-pieces,generated-pieces.file',
      sort: '-start-date',
    });

    let activities = [
      requestActivities.map((request) => Activity.create(request, null)),
      proofingActivities.map((proofing) => Activity.create(null, proofing)),
    ];
    activities = await Promise.all(activities.flatMap((activity) => activity.toArray()));
    activities = activities.sortBy('date').reverseObjects();

    return activities;
  }

  async afterModel() {
    this.publicationFlow = this.modelFor('publications.publication');
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.publicationFlow = this.publicationFlow;
    controller.publicationSubcase = this.publicationSubcase;
  }

  @action
  refresh() {
    super.refresh();
  }
}
