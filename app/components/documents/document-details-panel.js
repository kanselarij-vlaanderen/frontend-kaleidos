import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';

/**
 * @param {Piece} piece
 */
export default class DocumentsDocumentDetailsPanel extends Component {
  @service currentSession;
  @service pieceAccessLevelService;

  @tracked isEditingDetails = false;
  @tracked isUploadingReplacementFile = false;
  @tracked replacementFile;
  @tracked documentType;
  @tracked accessLevel;

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
  }

  @task
  *cancelEditDetails() {
    this.args.piece.rollbackAttributes(); // in case of piece name change
    yield this.loadDetailsData.perform();
    yield this.replacementFile?.destroyRecord();
    this.isUploadingReplacementFile = false;
    this.replacementFile = null;
    this.isEditingDetails = false;
  }

  @task
  *saveDetails() {
    if (this.replacementFile) {
      const oldFile = yield this.args.piece.file;
      yield oldFile.destroyRecord();
      this.args.piece.file = this.replacementFile;
    }
    this.args.piece.accessLevel = this.accessLevel;
    yield this.args.piece.save();
    yield this.pieceAccessLevelService.updatePreviousAccessLevels(
      this.args.piece
    );
    this.args.documentContainer.type = this.documentType;
    yield this.args.documentContainer.save();
    this.isEditingDetails = false;
    this.replacementFile = null;
    this.isUploadingReplacementFile = !this.isUploadingReplacementFile;
  }

  @action
  async toggleUploadReplacementFile() {
    await this.replacementFile?.destroyRecord();
    this.replacementFile = null;
    this.isUploadingReplacementFile = !this.isUploadingReplacementFile;
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
}
