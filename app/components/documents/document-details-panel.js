import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { isPresent } from '@ember/utils';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import sanitize from 'sanitize-filename';

/**
 * @param {Piece} piece
 */
export default class DocumentsDocumentDetailsPanel extends Component {
  @service pieceAccessLevelService;
  @service fileConversionService;
  @service intl;
  @service toaster;
  @service signatureService;
  @service currentSession;
  @service documentService;
  @service store;

  @tracked isEditingDetails = false;
  @tracked isOpenVerifyDeleteModal = false;
  @tracked isReplacingSourceFile = false;
  @tracked isUploadingReplacementSourceFile = false;
  @tracked isAddingSourceFile = false;
  @tracked isUploadingSourceFile = false;
  @tracked isOpenVerifyDeleteSignFlow = false;

  @tracked replacementSourceFile;
  @tracked uploadedSourceFile;
  @tracked documentType;
  @tracked accessLevel;
  @tracked isLastVersionOfPiece;
  @tracked signedPieceCopy;
  @tracked internalReview;

  @tracked canEditPieceWithSignFlow = false;

  constructor() {
    super(...arguments);
    this.loadDetailsData.perform();
    this.loadSignatureRelatedData.perform();
    this.loadSignedPieces.perform();
    this.loadInternalReview.perform();
  }

  get isProcessing() {
    return (
      this.saveDetails.isRunning ||
      this.cancelEditDetails.isRunning ||
      this.isUploadingReplacementSourceFile ||
      this.isUploadingSourceFile
    );
  }

  get isDraftPiece() {
    return this.args.piece.constructor.modelName === 'draft-piece';
  }

  // @piece.downloadlinkPromise does not recalculate after edit of this.args.piece.name
  // we want the piece name + the correct file download (in this case always the source file)
  get downloadLinkSourceFile() {
    const file = this.args.piece.get('file');
    if (file) {
      const filename = `${this.args.piece.name}.${file.get('extension')}`;
      const downloadFilename = sanitize(filename, {
        replacement: '_',
      });
      return `${file.get('downloadLink')}?name=${encodeURIComponent(
        downloadFilename
      )}`;
    }
    // should be unreachable, getter used in template with {{#if @piece.file}}
    return undefined;
  }

  @task
  *loadSignatureRelatedData() {
    if (this.args.piece.constructor.relationshipNames.belongsTo.includes('signMarkingActivity')) {
      const hasSignFlow = yield this.signatureService.hasSignFlow(this.args.piece);
      const hasMarkedSignFlow = yield this.signatureService.hasMarkedSignFlow(this.args.piece);
      return this.canEditPieceWithSignFlow = !hasSignFlow || hasMarkedSignFlow;
    }
    return this.canEditPieceWithSignFlow = true;
  }

  @task
  *loadSignedPieces() {
    this.signedPieceCopy = yield this.args.piece?.signedPieceCopy;
    yield this.signedPieceCopy?.belongsTo('accessLevel').reload();
    yield this.signedPieceCopy?.belongsTo('file').reload();
  }

  @task
  *loadDetailsData() {
    this.documentType = yield this.args.documentContainer.type;
    this.accessLevel = yield this.args.piece.accessLevel;
    this.isLastVersionOfPiece = !isPresent(yield this.args.piece.nextPiece);
  }

  @task
  *loadInternalReview() {
    if (this.currentSession.may('manage-agendaitems')) {
      const internalReviewOfSubcase = yield this.store.queryOne('submission-internal-review', {
        'filter[subcase][submission-activities][pieces][:id:]': this.args.piece.id,
      })
      if (internalReviewOfSubcase?.id) {
        this.internalReview = internalReviewOfSubcase;
        return;
      }
      const internalReviewOfSubmission = yield this.store.queryOne('submission-internal-review', {
        'filter[submissions][pieces][:id:]': this.args.piece.id,
      })
      if (internalReviewOfSubmission?.id) {
        this.internalReview = internalReviewOfSubmission;
        return;
      }
    }
  }

  @action
  handleReplacementFileUploadQueue({ uploadIsRunning, uploadIsCompleted}) {
    this.isUploadingReplacementSourceFile = uploadIsRunning && !uploadIsCompleted;
  }

  @action
  handleSourceFileUploadQueue({ uploadIsRunning, uploadIsCompleted}) {
    this.isUploadingSourceFile = uploadIsRunning && !uploadIsCompleted;
  }

  @task
  *cancelEditDetails() {
    this.args.piece.rollbackAttributes(); // in case of piece name change
    yield this.loadDetailsData.perform();
    yield this.replacementSourceFile?.destroyRecord();
    yield this.addedSourceFile?.destroyRecord();
    this.isReplacingSourceFile = false;
    this.replacementSourceFile = null;
    this.isAddingSourceFile = false;
    this.uploadedSourceFile = null;
    this.isEditingDetails = false;
  }

  @task
  *saveDetails() {
    let signMarkingActivity;
    if (this.args.piece.constructor.relationshipNames.belongsTo.includes('signMarkingActivity')) {
      signMarkingActivity = yield this.args.piece.belongsTo('signMarkingActivity').reload();
    }
    if (signMarkingActivity) {
      const signSubcase = yield signMarkingActivity?.signSubcase;
      const signFlow = yield signSubcase?.signFlow;
      const status = yield signFlow?.belongsTo('status').reload();
      if (!this.currentSession.may('edit-documents-with-ongoing-signature')) {
        if (status?.uri !== CONSTANTS.SIGNFLOW_STATUSES.MARKED) {
          yield this.cancelEditDetails.perform();
          yield this.loadSignatureRelatedData.perform();
          this.toaster.error(
            this.intl.t('sign-flow-was-sent-while-you-were-editing-could-not-edit'),
            this.intl.t('changes-could-not-be-saved-title'),
          );
          return;
        }
      }
    }
    if (this.uploadedSourceFile) {
      // use-case: we have a pdf and we want to add docx but keep our pdf
      // derived file does not exist yet in this case
      const oldFile = yield this.args.piece.file;
      this.uploadedSourceFile.derived = oldFile;
      this.args.piece.file = this.uploadedSourceFile;
      yield Promise.all([oldFile.save(), this.uploadedSourceFile.save()]);
    }
    if (this.replacementSourceFile) {
      const oldFile = yield this.args.piece.file;
      // oldFile may not exist in rare cases where file is missing/not automatically generated, you should be able to replace
      const derivedFile = yield oldFile?.derived;
      if (derivedFile) {
        oldFile.derived = null;
        this.replacementSourceFile.derived = derivedFile;
        yield Promise.all([oldFile.save(), this.replacementSourceFile.save()]);
      }
      yield oldFile?.destroyRecord();
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
    this.args.piece.accessLevel = this.accessLevel;
    this.args.piece.name = this.args.piece.name?.trim();
    yield this.args.piece.save();
    yield this.pieceAccessLevelService.updatePreviousAccessLevels(
      this.args.piece
    );
    this.args.documentContainer.type = this.documentType;
    yield this.args.documentContainer.save();
    if (this.replacementSourceFile) {
      if (this.args.piece.stamp) {
        yield this.documentService.stampDocuments([this.args.piece]);
      }
    } else {
      yield this.documentService.checkAndRestamp([this.args.piece]);
    }

    this.isEditingDetails = false;
    this.replacementSourceFile = null;
    this.isReplacingSourceFile = false;
    this.uploadedSourceFile = null;
    this.isUploadingSourceFile = false;
  }

  verifyDeleteSignFlow = task(async () => {
    await this.signatureService.removeSignFlowForPiece(this.args.piece, true);
    this.isOpenVerifyDeleteSignFlow = false;
  });

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

  canViewConfidentialPiece = async () => {
    return await this.pieceAccessLevelService.canViewConfidentialPiece(this.args.piece);
  }

  canViewSignedPiece = async () => {
    if (this.currentSession.may('manage-signatures')) {
      return await this.signatureService.canManageSignFlow(this.args.piece);
    }
    return false;
  }

  @action
  async changeAccessLevelOfSignedPiece(pieceOrPromise, accessLevel) {
    const piece = await pieceOrPromise;
    if (piece) {
      piece.accessLevel = accessLevel;
    }
  }

  @action
  async saveAccessLevelOfSignedPiece(pieceOrPromise) {
    const piece = await pieceOrPromise;
    if (piece) {
      await piece.save();
    }
  }
}
