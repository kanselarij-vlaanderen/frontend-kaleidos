import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class DocumentsDocumentCardEditModalComponent extends Component {
  /**
   * @param {Piece} piece: the piece we will be editing
   * @param {DocumentContainer} documentContainer: the documentContainer the piece belongs to
   * @param {Function} onSave: the action to execute after saving changes
   * @param {Function} onCancel: the action to execute after cancelling the edit
   */
  @service intl;
  @service toaster;
  @service fileConversionService;

  @tracked isUploadingSourceFile = false;
  @tracked isReplacingSourceFile = false;
  @tracked isReplacingDerivedFile = false;
  @tracked isUploadingDerivedFile = false;
  @tracked isDeletingDerivedFile = false;

  @tracked isUploadingReplacementSourceFile = false;
  @tracked isUploadingReplacementDerivedFile = false;

  @tracked name;
  @tracked documentType;

  @tracked uploadedSourceFile;
  @tracked uploadedDerivedFile;
  @tracked replacementSourceFile;
  @tracked replacementDerivedFile;

  constructor() {
    super(...arguments);

    this.name = this.args.piece.name;
    this.loadData.perform();
  }

  loadData = task(async () => {
    this.documentType = await this.args.documentContainer.type;
  });

  get isDisabled() {
    return (
      this.saveEdit.isRunning
        || this.isUploadingSourceFile
        || this.isUploadingDerivedFile
        || this.isUploadingReplacementDerivedFile
        || this.isUploadingReplacementSourceFile
    );
  }

  @action
  handleSourceFileUploadQueue({ uploadIsRunning, uploadIsCompleted}) {
    this.isUploadingSourceFile = uploadIsRunning && !uploadIsCompleted;
  }

  @action
  handleDerivedFileUploadQueue({ uploadIsRunning, uploadIsCompleted}) {
    this.isUploadingDerivedFile = uploadIsRunning && !uploadIsCompleted;
  }

  @action
  handleReplacementSourceFileUploadQueue({ uploadIsRunning, uploadIsCompleted}) {
    this.isUploadingReplacementSourceFile = uploadIsRunning && !uploadIsCompleted;
  }

  @action
  handleReplacementDerivedFileUploadQueue({ uploadIsRunning, uploadIsCompleted}) {
    this.isUploadingReplacementDerivedFile = uploadIsRunning && !uploadIsCompleted;
  }

  @action
  async toggleUploadReplacementSourceFile() {
    await this.replacementSourceFile?.destroyRecord();
    this.replacementSourceFile = null;
    this.isReplacingSourceFile = !this.isReplacingSourceFile;
  }

  @action
  async toggleUploadReplacementDerivedFile() {
    await this.replacementDerivedFile?.destroyRecord();
    this.replacementDerivedFile = null;
    this.isReplacingDerivedFile = !this.isReplacingDerivedFile;
  }

  @action
  selectDocumentType(value) {
    this.documentType = value;
  }

  @action
  async cancelEdit() {
    this.name = null;

    await this.uploadedSourceFile?.destroyRecord();
    this.isUploadingSourceFile = false;
    this.uploadedSourceFile = null;

    await this.replacementSourceFile?.destroyRecord();
    this.isReplacingSourceFile = false;
    this.replacementSourceFile = null;

    await this.replacementDerivedFile?.destroyRecord();
    this.isReplacingDerivedFile = false;
    this.replacementDerivedFile = null;

    await this.uploadedDerivedFile?.destroyRecord();
    this.uploadedDerivedFile = null;

    this.isDeletingDerivedFile = false;

    this.args.onCancel?.();
  }

  saveEdit = task(async () => {
    if (this.args.signFlow) {
      const status = await this.args.signFlow.belongsTo('status').reload();
      if (status.uri !== CONSTANTS.SIGNFLOW_STATUSES.MARKED) {
        this.cancelEdit();
        this.toaster.error(
          this.intl.t('sign-flow-was-sent-while-you-were-editing-could-not-edit'),
          this.intl.t('changes-could-not-be-saved-title'),
        );
        return;
      }
    }

    this.args.piece.name = this.name?.trim();
    this.args.documentContainer.type = this.documentType;
    // If a piece has pieceParts, remove them
    // Might need to be improved to work for other piece subtypes
    const pieceParts = await this.args.piece.pieceParts;
    if (pieceParts?.length) {
      for (const piecePart of pieceParts.slice()) {
        await piecePart.destroyRecord();
      }
    }
    if (this.uploadedSourceFile) {
      // use-case: we have a pdf and we want to add docx but keep our pdf
      // derived file does not exist yet in this case
      const oldFile = await this.args.piece.file;
      this.uploadedSourceFile.derived = oldFile;
      this.args.piece.file = this.uploadedSourceFile;
      await Promise.all([oldFile.save(), this.uploadedSourceFile.save()]);
    }
    if (this.replacementSourceFile) {
      const oldFile = await this.args.piece.file;
      const derivedFile = await oldFile.derived;
      if (derivedFile) {
        oldFile.derived = null;
        this.replacementSourceFile.derived = derivedFile;
        await Promise.all([oldFile.save(), this.replacementSourceFile.save()]);
      }
      this.args.piece.file = this.replacementSourceFile;
      await oldFile.destroyRecord();
      try {
        await this.fileConversionService.convertSourceFile(
          this.replacementSourceFile
        );
      } catch (error) {
        this.toaster.error(
          this.intl.t('error-convert-file', { message: error.message }),
          this.intl.t('warning-title')
        );
      }
    }
    if (this.replacementDerivedFile) {
      const file = await this.args.piece.file;
      const oldDerived = await file.derived;
      file.derived = this.replacementDerivedFile;
      await file.save();
      await oldDerived.destroyRecord();
    }
    if (this.uploadedDerivedFile) {
      const file = await this.args.piece.file;
      file.derived = this.uploadedDerivedFile;
      await file.save();
    }
    if (this.isDeletingDerivedFile) {
      const file = await this.args.piece.file;
      const derivedFile = await file.derived;
      file.derived = null;
      await file.save();
      await derivedFile.destroyRecord();
    }
    await this.args.piece.save();
    await this.args.documentContainer.save();

    this.name = null;

    this.documentType = null;

    this.args.onSave?.();

    this.isUploadingSourceFile = false;
    this.uploadedSourceFile = null;

    this.isReplacingSourceFile = false;
    this.replacementSourceFile = null;

    this.isReplacingDerivedFile = false;
    this.replacementDerivedFile = false;

    this.uploadedDerivedFile = null;
    this.isDeletingDerivedFile = false;
  });
}
