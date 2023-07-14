import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class DocumentsDocumentCardEditModalComponent extends Component {
  /**
   * @param {Piece} piece: the piece we will be editing
   * @param {Function} onSave: the action to execute after saving changes
   * @param {Function} onCancel: the action to execute after cancelling the edit
   */
  @service intl;
  @service router;
  @service toaster;
  @service fileConversionService;

  @tracked isReplacingSourceFile = false;
  @tracked isReplacingDerivedFile = false;
  @tracked isUploadingDerivedFile = false;
  @tracked isDeletingDerivedFile = false;

  @tracked isUploadingReplacementSourceFile = false;
  @tracked isUploadingReplacementDerivedFile = false;

  @tracked name;
  @tracked uploadedDerivedFile;
  @tracked replacementSourceFile;
  @tracked replacementDerivedFile;

  constructor() {
    super(...arguments);

    this.name = this.args.piece.name;
  }

  get isDisabled() {
    return (
      this.saveEdit.isRunning
        || this.isUploadingDerivedFile
        || this.isUploadingReplacementDerivedFile
        || this.isUploadingReplacementSourceFile
    );
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
  async cancelEdit() {
    this.name = null;

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

    const now = new Date();
    this.args.piece.modified = now;
    this.args.piece.name = this.name?.trim();
    // If a piece has pieceParts, remove them
    // Might need to be improved to work for other piece subtypes
    const pieceParts = await this.args.piece.pieceParts;
    if (pieceParts) {
      for (const piecePart of pieceParts.toArray()) {
        await piecePart.destroyRecord();
      }
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
    this.args.piece.created = now;
    await this.args.piece.save();

    this.name = null;

    this.isReplacingSourceFile = false;
    this.replacementSourceFile = null;

    this.isReplacingDerivedFile = false;
    this.replacementDerivedFile = false;

    this.uploadedDerivedFile = null;
    this.isDeletingDerivedFile = false;

    this.args.onSave?.();
  });
}
