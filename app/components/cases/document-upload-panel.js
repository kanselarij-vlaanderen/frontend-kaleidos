import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';

export default class DocumentUploadPlanel extends Component {
  @service store;

  @action
  scrollIntoView(element) {
    element.scrollIntoView({
      behavior: 'smooth', block: 'start',
    });
  }

  @action
  uploadPiece(file) {
    const now = new Date();
    const documentContainer = this.store.createRecord('document-container', {
      created: now,
    });
    const piece = this.store.createRecord('piece', {
      created: now,
      modified: now,
      file: file,
      name: file.filenameWithoutExtension,
      documentContainer: documentContainer,
    });
    this.args.addPieceToNewPieces(piece);
  }

  @task
  *deletePiece(piece) {
    yield this.args.deletePiece(piece);
  }
}