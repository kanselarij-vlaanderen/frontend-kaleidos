import Route from '@ember/routing/route';
import { Row } from './controller';

export default class PublicationsPublicationProofsRequestsRoute extends Route {
  async model() {
    const publicationSubcase = this.modelFor('publications.publication.proofs');
    const requestActivities = await this.store.query('request-activity', {
      'filter[publication-subcase][:id:]': publicationSubcase.id,
      include: [
        'email',
        'used-pieces',
        'used-pieces.file',
        'proofing-activity',
        'proofing-activity.generated-pieces',
        'proofing-activity.generated-pieces.file',
        'publication-activity',
        'publication-activity.generated-pieces',
        'publication-activity.generated-pieces.file'
      ].join(','),
      sort: '-start-date',
    });

    // rows are created here to prevent rendering before resolution
    const model = await Promise.all(requestActivities.map(this.createRow));
    return model;
  }

  async afterModel() {
    // publicationSubcase.publicationFlow causes network request while, but the request is already made in 'publications.publication'
    this.publicationFlow = this.modelFor('publications.publication');
    this.publicationSubcase = await this.publicationFlow.publicationSubcase;
  }

  setupController(controller) {
    super.setupController(...arguments);

    // publicationSubcase.publicationFlow causes network request while, but the request is already made in 'publications.publication'
    controller.publicationFlow = this.publicationFlow;
    controller.publicationSubcase = this.publicationSubcase;
    controller.selectedRow = undefined;
    controller.isUploadModalOpen = false;
  }

  async createRow(requestActivity) {
    const [proofingActivity, publicationActivity] = await Promise.all([
      requestActivity.proofingActivity,
      requestActivity.publicationActivity
    ]);

    return new Row({
      requestActivity: requestActivity,
      proofingActivity: proofingActivity,
      publicationActivity: publicationActivity,
    });
  }
}
