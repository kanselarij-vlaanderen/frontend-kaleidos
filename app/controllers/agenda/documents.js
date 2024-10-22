import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task, all } from 'ember-concurrency';
import { TrackedArray } from 'tracked-built-ins';
import { removeObject } from 'frontend-kaleidos/utils/array-helpers';

export default class AgendaDocumentsController extends Controller {
  @service store;
  @service toaster;
  @service fileConversionService;
  @service router;
  @service intl;
  @service pieceAccessLevelService;

  agenda;
  meeting;
  defaultAccessLevel;
  @tracked isOpenBatchDetailsModal = false;
  @tracked isOpenPieceUploadModal = false;
  @tracked newPieces = new TrackedArray([]);

  @action
  openPieceUploadModal() {
    this.isOpenPieceUploadModal = true;
  }

  @action
  uploadPiece(file) {
    const now = new Date();
    const documentContainer = this.store.createRecord('document-container', {
      created: now,
    });
    const piece = this.store.createRecord('piece', {
      created: now,
      modified: now,
      file: file,
      accessLevel: this.defaultAccessLevel,
      name: file.filenameWithoutExtension,
      meeting: this.meeting,
      documentContainer: documentContainer,
    });
    this.newPieces.push(piece);
  }

  @task
  *savePieces() {
    const savePromises = this.newPieces.map(async(piece, index) => {
      try {
        await this.savePiece.perform(piece, index);
      } catch (error) {
        await this.deletePiece.perform(piece);
        throw error;
      }
    });
    yield all(savePromises);
    this.isOpenPieceUploadModal = false;
    this.newPieces = new TrackedArray([]);
    this.router.refresh('agenda.documents');
  }

  /**
   * Save a new document container and the piece it wraps
  */
  @task
  *savePiece(piece, index) {
    const documentContainer = yield piece.documentContainer;
    const containerCount = yield this.store.count('document-container', {
      'filter[pieces][meeting][id]': this.meeting.id,
    });
    documentContainer.position = index + 1 + (containerCount ?? 0);
    yield documentContainer.save();
    piece.name = piece.name?.trim()
    yield piece.save();
    try {
      const sourceFile = yield piece.file;
      yield this.fileConversionService.convertSourceFile(sourceFile);
    } catch (error) {
      this.toaster.error(
        this.intl.t('error-convert-file', { message: error.message }),
        this.intl.t('warning-title'),
      );
    }
  }

  /**
   * Add new piece to an existing document container
  */
  @task
  *addPiece(piece) {
    piece.meeting = this.meeting;
    yield piece.save();
    yield this.pieceAccessLevelService.updatePreviousAccessLevel(piece);
    try {
      const sourceFile = yield piece.file;
      yield this.fileConversionService.convertSourceFile(sourceFile);
    } catch (error) {
      this.toaster.error(
        this.intl.t('error-convert-file', { message: error.message }),
        this.intl.t('warning-title'),
      );
    }
    this.router.refresh('agenda.documents');
  }

  @task
  *cancelUploadPieces() {
    const deletePromises = this.newPieces.map((piece) => this.deletePiece.perform(piece));
    yield all(deletePromises);
    this.newPieces = new TrackedArray([]);
    this.isOpenPieceUploadModal = false;
  }

  @task
  *deletePiece(piece) {
    const file = yield piece.file;
    yield file.destroyRecord();
    removeObject(this.newPieces, piece);
    const documentContainer = yield piece.documentContainer;
    yield documentContainer.destroyRecord();
    yield piece.destroyRecord();
  }

  @action
  openBatchDetails() {
    this.isOpenBatchDetailsModal = true;
  }

  @action
  cancelBatchDetails() {
    this.isOpenBatchDetailsModal = false;
  }

  @action
  saveBatchDetails() {
    this.router.refresh('agenda.documents');
    this.isOpenBatchDetailsModal = false;
  }

  @action
  refresh() {
    this.router.refresh('agenda.documents');
  }
}
