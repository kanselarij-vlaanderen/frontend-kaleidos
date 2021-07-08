import Route from '@ember/routing/route';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';
import { A } from '@ember/array';

export default class PublicationsPublicationProofsDocumentsRoute extends Route {
  // model returns publicationSubcase instead of pieces: single request
  async model() {
    const publicationSubcaseId = this.modelFor('publications.publication.proofs').id;

    const queryProperties = {
      include: [
        'file'
      ].join(','),
      'page[size]': PAGE_SIZE.PUBLICATION_FLOW_PIECES,
    };

    // multiple requests: single request on publication-subcase did not detect inverse relations of piece to the publication-subcase
    // and made an extra request per piece
    const sourcePiecesRequest = this.store.query('piece', {
      'filter[publication-subcase-source-for][:id:]': publicationSubcaseId,
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

    const correctionDocumentsRequest = this.store.query('piece', {
      'filter[publication-subcase-correction-for][:id:]': publicationSubcaseId,
      include: [
        'file',
        'publication-subcase-correction-for'
      ].join(','),
    });

    let pieces = await Promise.all([sourcePiecesRequest, usedPiecesRequest, generatedPiecesRequest, correctionDocumentsRequest]);
    pieces = pieces.flatMap((piece) => piece.toArray());
    pieces = new Set(pieces); // using set to ensure a collection of unique pieces
    pieces = A([...pieces]);

    return pieces;
  }

  async afterModel() {
    // publicationSubcase.publicationFlow causes network request while, but the request is already made in 'publications.publication'
    this.publicationFlow = this.modelFor('publications.publication');
    this.publicationSubcase = await this.publicationFlow.publicationSubcase;
  }

  async setupController(controller) {
    super.setupController(...arguments);

    controller.publicationFlow = this.publicationFlow;
    controller.publicationSubcase = this.publicationSubcase;
    controller.selectedPieces = [];
    controller.initSort();
    controller.isPieceUploadModalOpen = false;
    controller.isProofRequestModalOpen = false;
  }
}
