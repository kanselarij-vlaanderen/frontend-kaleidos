import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import CopyErrorToClipboardToast from 'frontend-kaleidos/components/utils/toaster/copy-error-to-clipboard-toast';

export default class DocumentsDocumentCardAddSignedPieceModalComponent extends Component {
  /**
   * @param {Piece} piece: the piece we will be editing
   * @param {Function} onSave: the action to execute after saving changes
   * @param {Function} onCancel: the action to execute after cancelling the edit
   */
  @service intl;
  @service toaster;
  @service documentService;

  @tracked isUploadingReplacementFile = false;
  @tracked replacementFile;

  constructor() {
    super(...arguments);
  }

  get isDisabled() {
    return (
      !this.replacementFile ||
      this.saveEdit.isRunning ||
      this.isUploadingReplacementFile
    );
  }

  saveEdit = task(async () => {
    // save button will be disabled anyway if there is no file
    if (!this.replacementFile) {
      // TODO throw error? should be unreachable unless disabled param is removed
      return this.args.onCancel?.();
    }
    // 1 use case: remove the current PDF file (if any, derived or source) and use the new PDF file, call pdf strip feature
    const oldFile = await this.args.piece.file;
    const derivedFile = await oldFile?.derived;
    if (derivedFile) {
      oldFile.derived = null;
      await derivedFile.destroyRecord();
      oldFile.derived = this.replacementFile;
      await oldFile.save();
    } else {
      // either we replace a PDF or add a derived
      if (oldFile?.extension.toLowerCase() === 'pdf') {
        await oldFile.destroyRecord();
        this.args.piece.file = this.replacementFile;
      } else {
        // this could mean a missing oldFile and will fail in that case
        oldFile.derived = this.replacementFile;
        await oldFile.save();
      }
    }
    await this.args.piece.save();
    try {
      await this.documentService.triggerSignatureRemoval(this.args.piece);
      // TODO KAS-4921 what if the uploaded file does not contain a signature? we removed the stamped pdf, but get an error here so the new pdf isn't stamped
      // TODO KAS-4921 in testing, I allowed this action when signedPieces exist (it works just fine) but when errors happen here the signedpiece and copy are not removed
      if (this.args.piece.stamp) {
        await this.documentService.stampDocuments([this.args.piece]);
      }
    } catch (error) {
      const signedPieceUploadErrorOptions = {
        title: this.intl.t('warning-title'),
        errorContent: error.message,
        showDatetime: true,
        options: {
          timeOut: 60 * 10 * 1000,
        },
      };
      this.toaster.show(
        CopyErrorToClipboardToast,
        signedPieceUploadErrorOptions,
      );
    }

    this.args.onSave?.();
    this.replacementFile = null;
  });

  validateFile = (file) => {
    const extension = file.name.split('.').pop();
    const isPDF = extension.toLowerCase() === 'pdf';
    if (!isPDF) {
      this.toaster.error(
        this.intl.t('document-incorrect-file-type', { name: file.name }),
        this.intl.t('document-accepted-only-pdf'),
      );
      return false;
    }
  };

  handleReplacementFileUploadQueue = ({
    uploadIsRunning,
    uploadIsCompleted,
  }) => {
    this.isUploadingReplacementFile = uploadIsRunning && !uploadIsCompleted;
  };

  cancelEdit = async () => {
    await this.replacementFile?.destroyRecord();
    this.replacementFile = null;
    this.args.onCancel?.();
  };
}
