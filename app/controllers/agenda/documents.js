import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
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

  savePieces = task(async () => {
    const savePromises = this.newPieces.map(async(piece, index) => {
      try {
        await this.savePiece.perform(piece, index);
      } catch (error) {
        await this.deletePiece.perform(piece);
        throw error;
      }
    });
    await all(savePromises);
    this.isOpenPieceUploadModal = false;
    this.newPieces = new TrackedArray([]);
    this.router.refresh('agenda.documents');
  });

  /**
   * Save a new document container and the piece it wraps
  */
  savePiece = task(async (piece, index) => {
    const documentContainer = await piece.documentContainer;
    const containerCount = await this.store.count('document-container', {
      'filter[pieces][meeting][id]': this.meeting.id,
    });
    documentContainer.position = index + 1 + (containerCount ?? 0);
    await documentContainer.save();
    piece.name = piece.name?.trim()
    await piece.save();
    try {
      const sourceFile = await piece.file;
      await this.fileConversionService.convertSourceFile(sourceFile);
    } catch (error) {
      this.toaster.error(
        this.intl.t('error-convert-file', { message: error.message }),
        this.intl.t('warning-title'),
      );
    }
  });

  /**
   * Add new piece to an existing document container
  */
  addPiece = task(async (piece) => {
    piece.meeting = this.meeting;
    await piece.save();
    await this.pieceAccessLevelService.updatePreviousAccessLevel(piece);
    try {
      const sourceFile = await piece.file;
      await this.fileConversionService.convertSourceFile(sourceFile);
    } catch (error) {
      this.toaster.error(
        this.intl.t('error-convert-file', { message: error.message }),
        this.intl.t('warning-title'),
      );
    }
    this.router.refresh('agenda.documents');
  });

  cancelUploadPieces = task(async () => {
    const deletePromises = this.newPieces.map((piece) => this.deletePiece.perform(piece));
    await all(deletePromises);
    this.newPieces = new TrackedArray([]);
    this.isOpenPieceUploadModal = false;
  });

  deletePiece = task(async (piece) => {
    const file = await piece.file;
    await file.destroyRecord();
    removeObject(this.newPieces, piece);
    const documentContainer = await piece.documentContainer;
    await documentContainer.destroyRecord();
    await piece.destroyRecord();
  });

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
