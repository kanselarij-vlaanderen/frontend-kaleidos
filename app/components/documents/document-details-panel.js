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
  @tracked isUploadingReplacementSourceFile = false;
  @tracked replacementSourceFile;
  @tracked documentType;
  @tracked accessLevel;
  @tracked isLastVersionOfPiece;
  @tracked showSigned = true;

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
    yield this.replacementSourceFile?.destroyRecord();
    this.isUploadingReplacementSourceFile = false;
    this.replacementSourceFile = null;
    this.isEditingDetails = false;
  }

  @task
  *saveDetails() {
    if (this.replacementSourceFile) {
      const file = yield this.args.piece.file;
      const oldSourceFile = yield file.primarySource;
      yield oldSourceFile?.destroyRecord();
      file.primarySource = this.replacementSourceFile;
      yield file.save();
    }
    this.args.piece.accessLevel = this.accessLevel;
    yield this.args.piece.save();
    yield this.pieceAccessLevelService.updatePreviousAccessLevels(
      this.args.piece
    );
    this.args.documentContainer.type = this.documentType;
    yield this.args.documentContainer.save();
    this.isEditingDetails = false;
    this.replacementSourceFile = null;
    this.isUploadingReplacementSourceFile = !this.isUploadingReplacementSourceFile;
  }

  @action
  openEditDetails() {
    this.isEditingDetails = true;
  }

  @action
  setAccessLevel(accessLevel) {
    this.accessLevel = accessLevel;
  }

  @action
  setDocumentType(docType) {
    this.documentType = docType;
  }

  @action
  verifyDeleteDocument() {
    if (this.args.didDeletePiece) {
      this.args.didDeletePiece(this.args.piece);
    }
    this.isOpenVerifyDeleteModal = false;
  }

  @action
  deleteSigned() {
    this.showSigned = false;
  }
}
