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

    return [
      ...requestActivities.map((request) => new TimelineActivity(request)),
      ...proofingActivities.map((proofing) => new TimelineActivity(proofing)),
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
    super.refresh();
  }
}
