import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { warn } from '@ember/debug';

export class TimelineActivity {
  @tracked activity;

  constructor(activity) {
    this.activity = activity;
  }

  get isRequestActivity() {
    return this.activity.constructor.modelName === 'request-activity';
  }

  get isPublicationActivity() {
    return this.activity.constructor.modelName === 'publication-activity';
  }

  get date() {
    if (this.isRequestActivity) {
      return this.activity.startDate;
    } else if (this.isPublicationActivity) {
      return this.activity.startDate;
    } else {
      warn(
        `Getting date for unsupported activity type ${this.activity.constructor.modelName}`
      );
      return null;
    }
  }

  get isShown() {
    if (this.isPublicationActivity) {
      // A publication activity without end-date is created together with request-activity,
      // but should not be shown yet.
      return this.activity.isFinished;
    } else {
      return true;
    }
  }
}

export default class PublicationsPublicationPublicationActivitiesIndexRoute extends Route {
  @service store;
  @service router;

  async model() {
    this.publicationSubcase = this.modelFor(
      'publications.publication.publication-activities'
    );

    let requestActivities = this.store.query('request-activity', {
      'filter[publication-subcase][:id:]': this.publicationSubcase.id,
      'filter[:has:publication-activity]': true,
      // eslint-disable-next-line prettier/prettier
      include: [
        'email',
        'used-pieces',
        'used-pieces.file'
      ].join(','),
    });
    let publicationActivities = this.store.query('publication-activity', {
      'filter[subcase][:id:]': this.publicationSubcase.id,
      // eslint-disable-next-line prettier/prettier
      include: [
        'decisions',
      ].join(','),
    });

    [requestActivities, publicationActivities] = await Promise.all([
      requestActivities,
      publicationActivities,
    ]);

    return [
      ...requestActivities.map((request) => new TimelineActivity(request)),
      ...publicationActivities.map((publication) => new TimelineActivity(publication)),
    ]
      .sortBy('date')
      .reverseObjects();
  }

  afterModel() {
    this.publicationFlow = this.modelFor('publications.publication');
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.publicationFlow = this.publicationFlow;
    controller.publicationSubcase = this.publicationSubcase;
  }

  @action
  refresh() {
    // We want to refresh our own route + parent route which has the info panel
    this.router.refresh('publications.publication.publication-activities')
  }
}
