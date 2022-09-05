import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { isPresent } from '@ember/utils';
import { task } from 'ember-concurrency';

/**
 * @param {Piece} piece
 */
export default class DocumentsDocumentDetailsPanel extends Component {
  @service currentSession;
  @service pieceAccessLevelService;
  @tracked isEditingDetails = false;
  @tracked isOpenVerifyDeleteModal = false;
  @tracked documentType;
  @tracked accessLevel;
  @tracked isLastVersionOfPiece;

  constructor() {
    super(...arguments);
    this.loadDetailsData.perform();
  }

  get isProcessing() {
    return this.saveDetails.isRunning || this.cancelEditDetails.isRunning;
  }

  @task
  *loadDetailsData() {
    this.documentType = yield this.args.documentContainer.type;
    this.accessLevel = yield this.args.piece.accessLevel;
     this.isLastVersionOfPiece = !isPresent(yield this.args.piece.nextPiece);
  }

  @task
  *cancelEditDetails() {
    this.args.piece.rollbackAttributes(); // in case of piece name change
    yield this.loadDetailsData.perform();
    this.isEditingDetails = false;
  }

  @task
  *saveDetails() {
    this.args.piece.accessLevel = this.accessLevel;
    yield this.args.piece.save();
    yield this.pieceAccessLevelService.updatePreviousAccessLevels(
      this.args.piece
    );
    this.args.documentContainer.type = this.documentType;
    yield this.args.documentContainer.save();
    this.isEditingDetails = false;
  }

  @action
  openEditDetails() {
    this.isEditingDetails = true;
  }

  @action
  setDocumentType(docType) {
    this.documentType = docType;
  }

  @action
  async verifyDeleteDocument() {
    if (this.args.didDeletePiece) {
      this.args.didDeletePiece(this.args.piece);
    }
    this.isOpenVerifyDeleteModal = false;
  }
}
