import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class DocumentsDocumentCardEditModalComponent extends Component {
  /**
   * @param {Piece} piece: the piece we will be editing
   * @param {Function} onSave: the action to execute after saving changes
   * @param {Function} onCancel: the action to execute after cancelling the edit
   */

  @tracked isUploadingReplacementFile = false;
  @tracked isUploadingReplacementSourceFile = false;
  @tracked isDeletingSourceFile = false;

  @tracked name;
  @tracked uploadedSourceFile;
  @tracked replacementFile;
  @tracked replacementSourceFile;

  @service conceptStore;
  @tracked documentTypes = [];
  @tracked documentContainer;
  @tracked selectedDocumentType;

  constructor() {
    super(...arguments);

    this.name = this.args.piece.name.substr(24, 50).replace('- nota', '').replace('- decreet', '').replace('- memorie', '').replace('- advies', '').replace('- bijlage', '').replace('- BVR', '').replace('BIS', '').replace('TRIS', '').replace('QUAD', '');
    this.loadData.perform();
  }

  @task
  *loadData() {
    this.documentTypes = yield this.conceptStore.queryAllByConceptScheme(CONSTANTS.CONCEPT_SCHEMES.DOCUMENT_TYPES);

    this.documentContainer = yield this.args.piece.documentContainer;
    this.selectedDocumentType = yield this.documentContainer.type;
  }

  get sortedDocumentTypes() {
    return this.documentTypes.sortBy('position');
  }

  @action
  selectDocumentType(value) {
    this.selectedDocumentType = value;
    this.documentContainer.type = value;
  }

  @action
  async toggleUploadReplacementFile() {
    await this.replacementFile?.destroyRecord();
    this.replacementFile = null;
    this.isUploadingReplacementFile = !this.isUploadingReplacementFile;
  }

  @action
  async toggleUploadReplacementSourceFile() {
    await this.replacementSourceFile?.destroyRecord();
    this.replacementSourceFile = null;
    this.isUploadingReplacementSourceFile = !this.isUploadingReplacementSourceFile;
  }

  @action
  async cancelEdit() {
    this.name = null;

    await this.replacementFile?.destroyRecord();
    this.isUploadingReplacementFile = false;
    this.replacementFile = null;

    await this.replacementSourceFile?.destroyRecord();
    this.isUploadingReplacementSourceFile = false;
    this.replacementSourceFile = null;

    await this.uploadedSourceFile?.destroyRecord();
    this.uploadedSourceFile = null;

    this.isDeletingSourceFile = false;

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
    }
    if (this.replacementSourceFile) {
      const file = yield this.args.piece.file;
      const oldSource = yield file.primarySource;
      yield oldSource.destroyRecord();
      file.primarySource = this.replacementSourceFile;
      yield file.save();
    }
    if (this.uploadedSourceFile) {
      const file = yield this.args.piece.file;
      file.primarySource = this.uploadedSourceFile;
      yield file.save()
    }
    if (this.isDeletingSourceFile) {
      const file = yield this.args.piece.file;
      const sourceFile = yield file.primarySource;
      yield sourceFile.destroyRecord();
    }
    yield this.args.piece.save();

    this.name = null;

    this.isUploadingReplacementFile = false;
    this.replacementFile = null;

    this.isUploadingReplacementSourceFile = false;
    this.replacementSourceFile = false;

    this.uploadedSourceFile = null;
    this.isDeletingSourceFile = false;

    this.args.onSave?.();
  }
}
