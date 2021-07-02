import Route from '@ember/routing/route';

export default class PublicationsPublicationProofsDocumentsRoute extends Route {
  // model returns publicationSubcase instead of pieces: single request
  async model() {
    const publicationSubcaseId = this.modelFor('publications.publication.proofs').id;

    const sourcePiecesRequest = this.store.query('piece', {
      'filter[publication-subcase][:id:]': publicationSubcaseId,
      include: [
        'file',
        'publication-subcase'
      ].join(','),
    });

    const usedPiecesRequest = this.store.query('piece', {
      'filter[proofing-activities-used-by][subcase][:id:]': publicationSubcaseId,
      include: [
        'file',
        'proofing-activities-used-by',
        'proofing-activities-used-by.subcase'
      ].join(','),
    });

    const generatedPiecesRequest = this.store.query('piece', {
      'filter[publication-activity-generated-by][subcase][:id:]': publicationSubcaseId,
      include: [
        'file',
        'publication-activity-generated-by',
        'publication-activity-generated-by.subcase'
      ].join(','),
    });

    let pieces = await Promise.all([sourcePiecesRequest, usedPiecesRequest, generatedPiecesRequest]);
    pieces = pieces.flatMap((piece) => piece.toArray());

    return pieces;
  }

  async afterModel(model) {
    // publicationSubcase.publicationFlow causes network request while, but the request is already made in 'publications.publication'
    this.publicationFlow = this.modelFor('publications.publication');
    this.publicationSubcase = model;
  }

  async setupController(controller) {
    super.setupController(...arguments);

    controller.publicationSubcase = this.publicationSubcase;
    controller.publicationFlow = this.publicationFlow;
    controller.selection = [];
    controller.initSort();
    controller.isOpenRequestModal = false;
  }
}
