import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { sortPieces } from 'frontend-kaleidos/utils/documents';
import { task } from 'ember-concurrency';

export default class DocumentsDocumentListComponent extends Component {
  /**
   * A renderless component yielding a list of pieces.
   * In the case where multiple pieces are provided that belong to the same container,
   * only one piece per container will be yielded, featuring the most recent of the provided versions.
   *
   * @argument pieces: a regular JS Array of Piece objects
   */

  @tracked documentsByContainer;

  constructor() {
    super(...arguments);
    this.groupDocumentsByContainer.perform();
  }

  get tag() {
    return this.args.tag || 'div';
  }

  get documents() {
    return this.args.pieces;
  }

  get latestDocuments() {
    const latestDocs = [];
    if (this.documentsByContainer) {
      for (const docs of this.documentsByContainer.values()) {
        latestDocs.push(docs[0]);
      }
    }
    return latestDocs;
  }

  @task
  *groupDocumentsByContainer() {
    const documentsByContainer = new Map();
    // support ember-data record array
    for (const doc of this.documents) {
      const container = yield doc.documentContainer;
      if (documentsByContainer.has(container)) {
        documentsByContainer.get(container).push(doc);
      } else {
        documentsByContainer.set(container, [doc]);
      }
    }

    // this.documentsByContainer == { container1: [piece], container2: [piece, piece]}

    for (const key of documentsByContainer.keys()) {
      const documents = documentsByContainer.get(key);
      const sortedDocuments = sortPieces(documents);
      documentsByContainer.set(key, sortedDocuments);
    }
    // eslint-disable-next-line
    this.documentsByContainer = documentsByContainer; // re-assign array to trigger getter
  }
}
