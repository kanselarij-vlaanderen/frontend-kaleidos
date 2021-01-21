import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';
import { all } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';
import { warn } from '@ember/debug';
import { sortDocumentContainers } from 'fe-redpencil/utils/documents';

const batchSize = 20;

class DocumentHistory {
  /**
   * Document container to show the document history for
  */
  @tracked documentContainer
  /**
   * Piece until which the document history of the container should be shown
  */
  @tracked lastPiece
}

export default class DocumentList extends Component {
  @service store;
  @service fileService;

  @tracked documentHistories = A([]);
  @tracked documentsLoadedPercent = 0;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  get sortedDocumentHistories() {
    const containers = this.documentHistories.map((history) => history.documentContainer);
    const pieces = this.documentHistories.map((history) => history.lastPiece);
    const sortedContainers = sortDocumentContainers(pieces, containers);
    const sortedHistories = A([]);
    for (const container of sortedContainers) {
      const history = this.documentHistories.find((history) => history.documentContainer.get('id') === container.get('id'));
      sortedHistories.pushObject(history);
    }
    return sortedHistories;
  }

  @task
  *loadData() {
    const pieces = yield this.args.pieces;
    const pieceIds = pieces.map((piece) => piece.get('id'));

    // Get a list of unique document containers of the documents
    const uniqueDocumentContainers = new Set();
    for (let idx = 0; idx < pieces.length; idx = idx + batchSize) {
      const batch = pieceIds.slice(idx, idx + batchSize);
      const documentContainers = yield this.store.query('document-container', {
        'filter[pieces][id]': batch.join(','),
        include: 'type,pieces.access-level,pieces.previous-piece,pieces.next-piece',
        page: {
          size: batch.length,
        },
      });
      documentContainers.forEach((container) => uniqueDocumentContainers.add(container));
      this.documentsLoadedPercent = (uniqueDocumentContainers.size / pieces.length) * 100;
    }

    // For each document container, determine the lastest version to display
    this.documentHistories = yield all([...uniqueDocumentContainers].map((container) => this.createDocumentHistory.perform(container, pieces)));
    this.documentsLoadedPercent = 0;
  }

  @task
  *createDocumentHistory(documentContainer, allPieces) {
    const history = new DocumentHistory();
    history.documentContainer = documentContainer;

    const containerPieces = yield documentContainer.pieces;

    // This code is roughly similar to documentContainer.sortedPieces
    // The reason for this is to avoid dependency on the computed property
    const heads = [];
    for (const piece of containerPieces.toArray()) {
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
      sortedContainerPieces = containerPieces.sortBy('created');
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


  @task
  *saveEditPieces() {
    const updatePromises = this.documentHistories.map(async(history) => {
      if (history.lastPiece.softDeleted) {
        this.fileService.deleteDocumentContainer(history.documentContainer);
      } else {
        await history.lastPiece.save();
        await history.documentContainer.save();
      }
    });
    yield all(updatePromises);
    this.args.onCloseEdit();
  }

  @task
  *cancelEditPieces() {
    const rollbacks = this.documentHistories.map(async(history) => {
      history.lastPiece.set('softDeleted', false);
      history.lastPiece.rollbackAttributes();
      await history.lastPiece.belongsTo('accessLevel').reload();
      history.documentContainer.rollbackAttributes();
      history.documentContainer.belongsTo('type').reload();
    });
    yield all(rollbacks);
    this.args.onCloseEdit();
  }
}
