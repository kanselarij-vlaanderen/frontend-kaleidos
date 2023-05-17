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
  @service pieceAccessLevelService;
  @service fileConversionService;
  @service intl;
  @service toaster;

  @tracked isEditingDetails = false;
  @tracked isOpenVerifyDeleteModal = false;
  @tracked isReplacingSourceFile = false;
  @tracked isUploadingReplacementSourceFile = false;
  @tracked replacementSourceFile;
  @tracked documentType;
  @tracked accessLevel;
  @tracked isLastVersionOfPiece;

  constructor() {
    super(...arguments);
    this.loadDetailsData.perform();
  }

  get isProcessing() {
    return (
      this.saveDetails.isRunning
        || this.cancelEditDetails.isRunning
        || this.isUploadingReplacementSourceFile
    );
  }

  @task
  *loadDetailsData() {
    this.documentType = yield this.args.documentContainer.type;
    this.accessLevel = yield this.args.piece.accessLevel;
    this.isLastVersionOfPiece = !isPresent(yield this.args.piece.nextPiece);
  }

  @action
  handleReplacementFileUploadQueue({ uploadIsRunning, uploadIsCompleted}) {
    this.isUploadingReplacementSourceFile = uploadIsRunning && !uploadIsCompleted;
  }

  @task
  *cancelEditDetails() {
    this.args.piece.rollbackAttributes(); // in case of piece name change
    yield this.loadDetailsData.perform();
    yield this.replacementSourceFile?.destroyRecord();
    this.isReplacingSourceFile = false;
    this.replacementSourceFile = null;
    this.isEditingDetails = false;
  }

  @task
  *saveDetails() {
    if (this.replacementSourceFile) {
      const oldFile = yield this.args.piece.file;
      const derivedFile = yield oldFile.derived;
      if (derivedFile) {
        oldFile.derived = null;
        this.replacementSourceFile.derived = derivedFile;
        yield Promise.all([oldFile.save(), this.replacementSourceFile.save()]);
      }
      yield oldFile.destroyRecord();
      this.args.piece.file = this.replacementSourceFile;
      yield this.args.piece.save();
      const sourceFile = yield this.args.piece.file;
      try {
        yield this.fileConversionService.convertSourceFile(sourceFile);
      } catch (error) {
        this.toaster.error(
          this.intl.t('error-convert-file', { message: error.message }),
          this.intl.t('warning-title'),
        );
      }
      this.args.onChangeFile();
    }
    const now = new Date();
    this.args.piece.created = now;
    this.args.piece.accessLevel = this.accessLevel;
    yield this.args.piece.save();
    yield this.pieceAccessLevelService.updatePreviousAccessLevels(
      this.args.piece
    );
    this.args.documentContainer.type = this.documentType;
    yield this.args.documentContainer.save();
    this.isEditingDetails = false;
    this.replacementSourceFile = null;
    this.isReplacingSourceFile = !this.isReplacingSourceFile;
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
}
