import Route from '@ember/routing/route';

export default class PublicationsPublicationProofsRequestsRoute extends Route {
  async model() {
    const publicationSubcase = this.modelFor('publications.publication.proofs');
    const requestActivities = this.store.query('request-activity', {
      'filter[publication-subcase][:id:]': publicationSubcase.id,
      include: [
        'email',
        'proofing-activity',
        'proofing-activity.generated-pieces',
        'proofing-activity.generated-pieces.file',
        'publication-activity',
        'publication-activity.generated-pieces',
        'publication-activity.generated-pieces.file',
        'used-pieces',
        'used-pieces.file'
      ],
      sort: '-start-date',
    });

    return await requestActivities;
  }

  async afterModel(model) {
    await Promise.all(model.map(async(reqAct) => {
      await reqAct.publicationActivity;
      await reqAct.proofingActivity;
    }));
  }

  setupController(controller, model) {
    super.setupController.apply(this, arguments);

    controller.initRows(model);
    // publicationSubcase.publicationFlow causes network request while, but the request is already made in 'publications.publication'
    controller.publicationFlow = this.modelFor('publications.publication');
    controller.selectedRow = undefined;
    controller.isUploadModalOpen = false;
  }
}
