import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';

export default class DocumentsDraftDocumentCardEditModalComponent extends Component {
  /**
   * @param {Piece} piece: the piece we will be editing
   * @param {DocumentContainer} documentContainer: the documentContainer the piece belongs to
   * @param {Function} onSave: the action to execute after saving changes
   * @param {Function} onCancel: the action to execute after cancelling the edit
   */
  @service intl;
  @service toaster;
  @service fileConversionService;
  @service draftSubmissionService;

  @tracked isReplacingFile = false;
  @tracked isUploadingReplacementFile = false;
  @tracked replacementFile;

  @tracked name;
  @tracked documentType;

  constructor() {
    super(...arguments);

    this.name = this.args.piece.name;
    this.loadData.perform();
  }

  loadData = task(async () => {
    this.documentType = await this.args.documentContainer.type;
  });

  get isDisabled() {
    return this.saveEdit.isRunning || this.isUploadingReplacementFile;
  }

  validateFile = (file) => {
    return this.draftSubmissionService.validateUploadedFile(file);
  };

  @action
  handleReplacementFileUploadQueue({ uploadIsRunning, uploadIsCompleted }) {
    this.isUploadingReplacementFile = uploadIsRunning && !uploadIsCompleted;
  }

  @action
  async toggleUploadReplacementFile() {
    await this.replacementFile?.destroyRecord();
    this.replacementFile = null;
    this.isReplacingFile = !this.isReplacingFile;
  }

  @action
  selectDocumentType(value) {
    this.documentType = value;
  }

  @action
  async cancelEdit() {
    this.name = null;

    await this.replacementFile?.destroyRecord();
    this.isReplacingFile = false;
    this.replacementFile = null;

    this.args.onCancel?.();
  }

  saveEdit = task(async () => {
    this.args.piece.name = this.name?.trim();
    this.args.documentContainer.type = this.documentType;
    if (this.replacementFile) {
      // 1 use case: remove all current files (of this draft-piece) and use the new file
      const oldFile = await this.args.piece.file;
      const derivedFile = await oldFile.derived;
      if (derivedFile) {
        oldFile.derived = null;
        await derivedFile.destroyRecord();
      }
      this.args.piece.file = this.replacementFile;
      await oldFile.destroyRecord();
      try {
        await this.fileConversionService.convertSourceFile(
          this.replacementFile,
        );
      } catch (error) {
        this.toaster.error(
          this.intl.t('error-convert-file', { message: error.message }),
          this.intl.t('warning-title'),
        );
      }
    }
    await this.args.piece.save();
    await this.args.documentContainer.save();

    this.name = null;

    this.documentType = null;

    this.args.onSave?.();

    this.isReplacingFile = false;
    this.replacementFile = null;
  });
}
