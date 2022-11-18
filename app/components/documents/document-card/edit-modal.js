import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';

export default class DocumentsDocumentCardEditModalComponent extends Component {
  /**
   * @param {Piece} piece: the piece we will be editing
   * @param {Function} onSave: the action to execute after saving changes
   * @param {Function} onCancel: the action to execute after cancelling the edit
   */
  @service intl;
  @service toaster;
  @service fileService;

  @tracked isUploadingReplacementFile = false;
  @tracked isUploadingReplacementDerivedFile = false;
  @tracked isDeletingDerivedFile = false;

  @tracked name;
  @tracked uploadedDerivedFile;
  @tracked replacementFile;
  @tracked replacementDerivedFile;

  constructor() {
    super(...arguments);

    this.name = this.args.piece.name;
  }

  @action
  async toggleUploadReplacementFile() {
    await this.replacementFile?.destroyRecord();
    this.replacementFile = null;
    this.isUploadingReplacementFile = !this.isUploadingReplacementFile;
  }

  @action
  async toggleUploadReplacementDerivedFile() {
    await this.replacementDerivedFile?.destroyRecord();
    this.replacementDerivedFile = null;
    this.isUploadingReplacementDerivedFile = !this.isUploadingReplacementDerivedFile;
  }

  @action
  async cancelEdit() {
    this.name = null;

    await this.replacementFile?.destroyRecord();
    this.isUploadingReplacementFile = false;
    this.replacementFile = null;

    await this.replacementDerivedFile?.destroyRecord();
    this.isUploadingReplacementDerivedFile = false;
    this.replacementDerivedFile = null;

    await this.uploadedDerivedFile?.destroyRecord();
    this.uploadedDerivedFile = null;

    this.isDeletingDerivedFile = false;

    this.args.onCancel?.();
  }

  @task
  *saveEdit() {
    const now = new Date();
    this.args.piece.modified = now;
    this.args.piece.name = this.name;
    if (this.replacementFile) {
      const oldFile = yield this.args.piece.file;
      yield oldFile.destroyRecord();
      this.args.piece.file = this.replacementFile;
      try {
        yield this.fileService.convertSourceFile(this.replacementFile);
      } catch (error) {
        this.toaster.error(
          this.intl.t('error-convert-file', { message: error.message }),
          this.intl.t('warning-title'),
        );
      }
    }
    if (this.replacementDerivedFile) {
      const file = yield this.args.piece.file;
      const oldDerived = yield file.derived;
      file.derived = this.replacementDerivedFile;
      yield file.save();
      yield oldDerived.destroyRecord();
    }
    if (this.uploadedDerivedFile) {
      const file = yield this.args.piece.file;
      file.derived = this.uploadedDerivedFile;
      yield file.save()
    }
    if (this.isDeletingDerivedFile) {
      const file = yield this.args.piece.file;
      const derivedFile = yield file.derived;
      file.derived = null;
      yield file.save();
      yield derivedFile.destroyRecord();
    }
    yield this.args.piece.save();

    this.name = null;

    this.isUploadingReplacementFile = false;
    this.replacementFile = null;

    this.isUploadingReplacementDerivedFile = false;
    this.replacementDerivedFile = false;

    this.uploadedDerivedFile = null;
    this.isDeletingDerivedFile = false;

    this.args.onSave?.();
  }
}
