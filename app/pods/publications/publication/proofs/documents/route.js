import Route from '@ember/routing/route';

export default class PublicationsPublicationProofsDocumentsRoute extends Route {
  // model returns publicationSubcase instead of pieces: single request
  async model() {
    const publicationSubcaseFromParentRoute = this.modelFor('publications.publication.proofs');

    // findRecord with 'include' triggers extra requests
    const publicationSubcase = await this.store.queryOne('publication-subcase', {
      'filter[:id:]': publicationSubcaseFromParentRoute.id,
      include: [
        'source-documents',
        'source-documents.file',
        'proofing-activities',
        'proofing-activities.generated-pieces',
        'proofing-activities.generated-pieces.file',
        'publication-activities',
        'publication-activities.generated-pieces',
        'publication-activities.generated-pieces.file'
      ].join(','),
    });

    return publicationSubcase;
  }

  async afterModel(model) {
    // publicationSubcase.publicationFlow causes network request while, but the request is already made in 'publications.publication'
    this.publicationFlow = this.modelFor('publications.publication');
    this.publicationSubcase = model;
  }

  async setupController(controller, model) {
    super.setupController(...arguments);

    controller.publicationSubcase = this.publicationSubcase;
    controller.publicationFlow = this.publicationFlow;
    controller.initRows(model);
    controller.isOpenRequestModal = false;
  }
}
