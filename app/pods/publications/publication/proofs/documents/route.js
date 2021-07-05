import Route from '@ember/routing/route';

export default class PublicationsPublicationProofsDocumentsRoute extends Route {
  // model returns publicationSubcase instead of pieces: single request
  async model() {
    const publicationSubcaseId = this.modelFor('publications.publication.proofs').id;

    // multiple requests: single request on publication-subcase did not detect inverse relations of piece to the publication-subcase
    // and made an extra request per piece
    const sourcePiecesRequest = this.store.query('piece', {
      'filter[publication-subcase-source-for][:id:]': publicationSubcaseId,
      include: [
        'file',
        'publication-subcase-source-for'
      ].join(','),
    });

    const usedPiecesRequest = this.store.query('piece', {
      'filter[proofing-activity-generated-by][subcase][:id:]': publicationSubcaseId,
      include: [
        'file',
        'proofing-activity-generated-by',
        'proofing-activity-generated-by.subcase'
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

    const correctionDocumentsRequest = this.store.query('piece', {
      'filter[publication-subcase-correction-for][:id:]': publicationSubcaseId,
      include: [
        'file',
        'publication-subcase-correction-for'
      ].join(','),
    });

    let pieces = await Promise.all([sourcePiecesRequest, usedPiecesRequest, generatedPiecesRequest, correctionDocumentsRequest]);
    pieces = pieces.flatMap((piece) => piece.toArray());

    return pieces;
  }

  async afterModel() {
    // publicationSubcase.publicationFlow causes network request while, but the request is already made in 'publications.publication'
    this.publicationFlow = this.modelFor('publications.publication');
    this.publicationSubcase = this.modelFor('publications.publication.proofs');
  }

  async setupController(controller) {
    super.setupController(...arguments);

    controller.publicationSubcase = this.publicationSubcase;
    controller.publicationFlow = this.publicationFlow;
    controller.selection = [];
    controller.initSort();
    controller.isRequestModalOpen = false;
    controller.isUploadModalOpen = false;
  }
}
