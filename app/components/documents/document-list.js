import Component from '@glimmer/component';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import { sortPieces } from 'frontend-kaleidos/utils/documents';

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

  get documents() {
    return this.args.pieces;
  }

  get latestDocuments() {
    const latestDocs = [];
    for (const docs of this.documentsByContainer.values()) {
      latestDocs.push(docs[0]);
    }
    return latestDocs;
  }

  @task
  *groupDocumentsByContainer() {
    this.documentsByContainer = new Map();
    for (const doc of this.documents) {
      const container = yield doc.documentContainer;
      if (this.documentsByContainer.has(container)) {
        this.documentsByContainer.get(container).push(doc);
      } else {
        this.documentsByContainer.set(container, [doc]);
      }
    }
    // this.documentsByContainer == { container1: [piece], container2: [piece, piece]}

    for (const key of this.documentsByContainer.keys()) {
      const documents = this.documentsByContainer.get(key);
      const sortedDocuments = sortPieces(documents);
      this.documentsByContainer.set(key, sortedDocuments);
    }
    // eslint-disable-next-line
    this.documentsByContainer = this.documentsByContainer; // re-assign array to trigger getter
  }
}
