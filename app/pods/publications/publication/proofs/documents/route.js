import Route from '@ember/routing/route';

export default class PublicationsPublicationProofsDocumentsRoute extends Route {
  // model returns publicationSubcase instead of pieces: single request
  async model() {
    const publicationSubcaseId = this.modelFor('publications.publication.proofs').id;

    const queryProperties = {
      include: [
        'file'
      ].join(','),
      'page[size]': 100,
    };

    // 3 requests: single request on publication-subcase did not detect inverse relations of piece to the publication-subcase
    // and made an extra request per piece
    const sourceDocumentsRequest = this.store.query('piece', {
      'filter[publication-subcase][:id:]': publicationSubcaseId,
      ...queryProperties,
    });

    const usedPiecesRequest = this.store.query('piece', {
      'filter[proofing-activity-generated-by][subcase][:id:]': publicationSubcaseId,
      ...queryProperties,
    });

    const generatedPiecesRequest = this.store.query('piece', {
      'filter[publication-activity-generated-by][subcase][:id:]': publicationSubcaseId,
      ...queryProperties,
    });

    let pieces = await Promise.all([sourceDocumentsRequest, usedPiecesRequest, generatedPiecesRequest]);
    pieces = pieces.flatMap((pieces) => pieces.toArray());

    return pieces;
  }

  async afterModel() {
    // publicationSubcase.publicationFlow causes network request while, but the request is already made in 'publications.publication'
    this.publicationFlow = this.modelFor('publications.publication');
    this.publicationSubcase = this.modelFor('publications.publication.proofs');
  }

  async setupController(controller) {
    super.setupController(...arguments);

    controller.publicationFlow = this.publicationFlow;
    controller.publicationSubcase = this.publicationSubcase;
    controller.selectedPieces = [];
    controller.initSort();
    controller.isOpenProofRequestModal = false;
  }
}
