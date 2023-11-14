import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { isPresent, isEmpty } from '@ember/utils';
import { task } from 'ember-concurrency';
import ENV from 'frontend-kaleidos/config/environment';
import CONSTANTS from 'frontend-kaleidos/config/constants';

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

  @tracked isEditingDetails = false;
  @tracked isOpenVerifyDeleteModal = false;
  @tracked isReplacingSourceFile = false;
  @tracked isUploadingReplacementSourceFile = false;
  @tracked isOpenVerifyDeleteSignFlow = false;
  @tracked replacementSourceFile;
  @tracked documentType;
  @tracked accessLevel;
  @tracked isLastVersionOfPiece;

  @tracked canEditPieceWithSignFlow = false;

  constructor() {
    super(...arguments);
    this.loadDetailsData.perform();
    this.loadSignatureRelatedData.perform();
  }

  get isProcessing() {
    return (
      this.saveDetails.isRunning ||
      this.cancelEditDetails.isRunning ||
      this.isUploadingReplacementSourceFile
    );
  }

  get isSignaturesEnabled() {
    const isEnabled = !isEmpty(ENV.APP.ENABLE_SIGNATURES);
    return isEnabled;
  }

  @task
  *loadSignatureRelatedData() {
    const hasSignFlow = yield this.signatureService.hasSignFlow(this.args.piece);
    const hasMarkedSignFlow = yield this.signatureService.hasMarkedSignFlow(this.args.piece);
    return this.canEditPieceWithSignFlow = !hasSignFlow || hasMarkedSignFlow;
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
    const signMarkingActivity = yield this.args.piece.belongsTo('signMarkingActivity').reload();
    if (signMarkingActivity) {
      const signSubcase = yield signMarkingActivity?.signSubcase;
      const signFlow = yield signSubcase?.signFlow;
      const status = yield signFlow?.belongsTo('status').reload();
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
      const now = new Date();
      this.args.piece.created = now;
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
    this.isEditingDetails = false;
    this.replacementSourceFile = null;
    this.isReplacingSourceFile = !this.isReplacingSourceFile;
  }

  verifyDeleteSignFlow = task(async () => {
    await this.signatureService.removeSignFlow(this.args.piece);
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
}
