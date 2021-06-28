import Route from '@ember/routing/route';
import { buildIncludeString } from 'frontend-kaleidos/utils/ember-data-utils';

export default class PublicationsPublicationProofsRequestsRoute extends Route {
  model() {
    const includeFile = {
      file: true,
    };
    const includeString = buildIncludeString({
      email: true,
      proofingActivity: {
        generatedPieces: includeFile,
      },
      publicationActivity: {
        generatedPieces: includeFile,
      },
      usedPieces: includeFile,
    });
    const publicationSubcase = this.modelFor('publications.publication.proofs');
    const requestActivities = this.store.query('request-activity', {
      'filter[publication-subcase][:id:]': publicationSubcase.id,
      include: includeString,
      sort: '-start-date',
    });

    return requestActivities;
  }

  setupController(controller, model) {
    super.setupController.apply(this, arguments);

    controller.initRows(model);
  }
}
