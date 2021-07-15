import Route from '@ember/routing/route';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';
import { A } from '@ember/array';

import { Model } from './controller';

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
    const sourcePiecesPromise = this.store.query('piece', {
      'filter[publication-subcase-source-for][:id:]': publicationSubcaseId,
      ...queryProperties,
    });

    const usedPiecesPromise = this.store.query('piece', {
      'filter[proofing-activity-generated-by][subcase][:id:]': publicationSubcaseId,
      ...queryProperties,
    });

    const correctionDocumentsPromise = this.store.query('piece', {
      'filter[publication-subcase-correction-for][:id:]': publicationSubcaseId,
      include: [
        'file',
        'publication-subcase-correction-for'
      ].join(','),
    });

    const decisionsPromise = this.store.query('decision', {
      'filter[publication-activity][subcase][:id:]': publicationSubcaseId,
      sort: 'publication-date',
    });

    // disable lint: decisions is constant, but pieces is variable
    // eslint-disable-next-line prefer-const
    let [decisions, ...pieces] = await Promise.all([decisionsPromise, sourcePiecesPromise, usedPiecesPromise, correctionDocumentsPromise]);
    pieces = pieces.flatMap((pieces) => pieces.toArray());
    pieces = new Set(pieces); // using set to ensure a collection of unique pieces
    pieces = A([...pieces]);

    return new Model({
      pieces: pieces,
      decisions: decisions,
    });
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
