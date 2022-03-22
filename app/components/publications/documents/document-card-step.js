import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

/**
 * @argument {Piece} piece
 * @argument {boolean} isEnabledDelete
 * @argument {boolean} isViaCouncilOfMinisters
 * @argument {Function} onDelete
 */
export default class PublicationsDocumentsDocumentCardStepComponent extends Component {
  @tracked isOpenWordDocumentUploadModal;

  get hasWordVersionOfDocument() {
    const file = this.args.piece.file;
    if (file && ['doc', 'docx'].includes(file.extension.toLowerCase())) {
      return true;
    }
    return false;
  }

  @action
  openWordDocumentUploadModal() {
    this.isOpenWordDocumentUploadModal = true;
  }

  @action
  closeWordDocumentUploadModal() {
    this.isOpenWordDocumentUploadModal = false;
  }

  @task
  *saveWordDocument(file) {
    let files = yield this.args.piece.files;
    files.pushObject(file);
    yield this.args.piece.save();

    this.closeWordDocumentUploadModal();
  }

  @task
  *deletePiece() {
    yield this.args.onDelete();
  }
}
