import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { all, task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { TrackedArray } from 'tracked-built-ins';
import { resource, use } from 'ember-resources';
import { warn } from '@ember/debug';
import { sortDocumentContainers } from 'frontend-kaleidos/utils/documents';

const batchSize = 20;

class DocumentHistory {
  /**
   * Document container to show the document history for
  */
  @tracked documentContainer
  /**
   * Document until which the document history of the container should be shown
  */
  @tracked lastPiece
}

export default class LinkedDocumentList extends Component {
  @service store;

  @tracked documentHistories = new TrackedArray([]);

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @use sortedDocumentHistories = resource(() => {
    const sortedHistories = new TrackedArray([]);
    const calculateSortedDocumentHistories = async () => {
      sortedHistories.length = 0;
      const containers = await Promise.all(this.documentHistories.map((history) => history.documentContainer));
      const pieces = await Promise.all(this.documentHistories.map((history) => history.lastPiece));
      const sortedContainers = await sortDocumentContainers(pieces, containers);
      for (const container of sortedContainers) {
        const history = this.documentHistories.find((history) => history.documentContainer.get('id') === container.get('id'));
        sortedHistories.push(history);
      }
    };
    calculateSortedDocumentHistories();
    return sortedHistories;
  });

  @task
  *loadData() {
    const linkedPieces = yield this.args.linkedPieces;
    const linkedPieceIds = linkedPieces.map((piece) => piece.get('id'));

    // Get a list of unique document containers of the pieces
    const uniqueDocumentContainers = new Set();
    for (let idx = 0; idx < linkedPieces.length; idx = idx + batchSize) {
      const batch = linkedPieceIds.slice(idx, idx + batchSize);
      const documentContainers = yield this.store.query('document-container', {
        'filter[pieces][id]': batch.join(','),
        include: 'type,pieces.access-level,pieces.previous-piece,pieces.next-piece',
        page: {
          size: batch.length,
        },
      });
      documentContainers.forEach((container) => uniqueDocumentContainers.add(container));
    }

    // For each document container, determine the lastest version to display
    this.documentHistories = yield all([...uniqueDocumentContainers].map((container) => this.createDocumentHistory.perform(container, linkedPieces)));
  }

  @task
  *createDocumentHistory(documentContainer, allPieces) {
    const history = new DocumentHistory();
    history.documentContainer = documentContainer;

    const containerPieces = yield documentContainer.pieces;

    const heads = [];
    for (const piece of containerPieces.slice()) {
      const previousPiece = yield piece.previousPiece;
      if (!previousPiece) {
        heads.push(piece);
      }
    }

    let sortedContainerPieces = [];
    if (heads.length > 1) {
      warn('More than 1 possible head found for linked list of pieces. Falling back to sort by document creation date', {
        id: 'multiple-possible-linked-list-heads',
      });
      sortedContainerPieces = containerPieces
        .slice()
        .sort((p1, p2) => p1.created - p2.created);
    } else {
      let next = heads[0];
      while (next) {
        sortedContainerPieces.push(next);
        next = yield next.nextPiece;
      }
    }

    // Loop over the reverse sorted pieces and find the latest version that is also included
    // in all pieces.
    const reverseSortedContainerPieces = sortedContainerPieces.slice(0).reverse();
    for (const containerPiece of reverseSortedContainerPieces) {
      const matchingPiece = allPieces.find((piece) => piece.get('id') === containerPiece.get('id'));
      if (matchingPiece) {
        history.lastPiece = matchingPiece;
        break;
      }
    }

    return history;
  }
}
