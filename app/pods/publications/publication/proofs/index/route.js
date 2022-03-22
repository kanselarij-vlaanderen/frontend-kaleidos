import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { warn } from '@ember/debug';

export class TimelineActivity {
  @tracked activity;

  constructor(activity) {
    this.activity = activity;
  }

  get isRequestActivity() {
    return this.activity.constructor.modelName === 'request-activity';
  }

  get isProofingActivity() {
    return this.activity.constructor.modelName === 'proofing-activity';
  }

  get date() {
    if (this.isRequestActivity) {
      return this.activity.startDate;
    } else if (this.isProofingActivity) {
      return this.activity.startDate;
    } else {
      warn(
        `Getting date for unsupported activity type ${this.activity.constructor.modelName}`
      );
      return null;
    }
  }

  get isShown() {
    if (this.isProofingActivity) {
      // A proof activity without end-date is created together with request-activity,
      // but should not be shown yet.
      return this.activity.isFinished;
    } else {
      return true;
    }
  }
}

export default class PublicationsPublicationProofsRoute extends Route {
  @service store;

  async model() {
    this.publicationSubcase = this.modelFor('publications.publication.proofs');

    let requestActivities = this.store.query('request-activity', {
      'filter[publication-subcase][:id:]': this.publicationSubcase.id,
      'filter[:has:proofing-activity]': true,
      include: 'email,used-pieces,used-pieces.files',
      sort: '-start-date',
    });

    let proofingActivities = this.store.query('proofing-activity', {
      'filter[subcase][:id:]': this.publicationSubcase.id,
      include: 'generated-pieces,generated-pieces.files',
      sort: '-start-date',
    });

    [requestActivities, proofingActivities] = await Promise.all([
      requestActivities,
      proofingActivities,
    ]);

    return [
      ...requestActivities.map((request) => new TimelineActivity(request)),
      ...proofingActivities.map((proofing) => new TimelineActivity(proofing)),
    ]
      .sortBy('date')
      .reverseObjects();
  }

  async afterModel() {
    this.publicationFlow = this.modelFor('publications.publication');
    // query on 'publication-activity' and not 'request-activity':
    // 'publication-activity' can be present without 'request-activity'
    //    when it comes from legacy data or is created in a publication-status change to "Gepubliceerd"
    this.publicationActivitiesCount = await this.store.count(
      'publication-activity',
      {
        'filter[subcase][publication-flow][:id:]': this.publicationFlow.id,
      }
    );
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.publicationFlow = this.publicationFlow;
    controller.publicationSubcase = this.publicationSubcase;
    controller.publicationActivitiesCount = this.publicationActivitiesCount;
  }

  @action
  refresh() {
    super.refresh();
  }
}
