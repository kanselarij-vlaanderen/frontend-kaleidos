import Component from '@glimmer/component';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import VRDocumentName, { compareFunction as compareDocuments } from 'fe-redpencil/utils/vr-document-name';

export default class DocumentsDocumentListComponent extends Component {
  /**
   * A list of document cards.
   * In the case where multiple pieces are provided that belong to the same container,
   * only one card per container will be shown, featuring the most recent of the provided versions.
   *
   * @argument pieces: a regular JS Array of Piece objects
   * @argument didDeletePiece: action triggered when a piece from the list has been removed
   * @argument onOpenUploadModal: action triggered when the modal to upload a new version is being opened
   * @argument onAddPiece: action triggered when a new version has been uploaded
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
    for (const documents of this.documentsByContainer.values()) {
      documents.sort((docA, docB) => compareDocuments(new VRDocumentName(docA.name), new VRDocumentName(docB.name)));
    }
    this.documentsByContainer = this.documentsByContainer; // re-assign array to trigger getter
  }
}
