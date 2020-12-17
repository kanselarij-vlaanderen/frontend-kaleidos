import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import moment from 'moment';

export default class PublicationPublishPreviewController extends Controller {
  @tracked withdrawn = true;
  @tracked isOpenUploadPublishPreviewModal = false;
  @tracked isOpenUploadPublishPreviewCorrectionModal = false;
  @tracked uploadedFile = null;
  @tracked pieceInCreation = null;
  @tracked isSavingPieces = false;
  @tracked isUploadModalResized = false;
  @tracked showLoader = false;
  @tracked activityToAddPiecesTo = null;

  get publishPreviewActivities() {
    const publishPreviewActivities = this.model.publishPreviewActivities.map((activity) => activity);
    return publishPreviewActivities;
  }

  @action
  toggleUploadModalSize() {
    this.isUploadModalResized = !this.isUploadModalResized;
  }

  @action
  openUploadPublishPreviewModal(activity) {
    this.activityToAddPiecesTo = activity;
    this.isOpenUploadPublishPreviewModal = true;
  }

  @action
  openUploadPublishPreviewCorrectionModal(activity) {
    this.activityToAddPiecesTo = activity;
    this.isOpenUploadPublishPreviewCorrectionModal = true;
  }

  @action
  uploadPublishPreview(file) {
    const now = moment().utc()
      .toDate();
    const documentContainer = this.store.createRecord('document-container', {
      created: now,
    });
    const piece = this.store.createRecord('piece', {
      created: now,
      modified: now,
      file: file,
      accessLevel: this.defaultAccessLevel,
      confidential: false,
      name: file.filenameWithoutExtension,
      documentContainer: documentContainer,
    });
    this.pieceInCreation = piece;
  }

  @action
  uploadPublishPreviewCorrection(file) {
    const now = moment().utc()
      .toDate();
    const piece = this.store.createRecord('piece', {
      created: now,
      modified: now,
      file: file,
      accessLevel: this.defaultAccessLevel,
      confidential: false,
      name: file.filenameWithoutExtension,
    });
    this.pieceInCreation = piece;
  }

  @task
  *savePublishPreview() {
    this.showLoader = true;
    this.isOpenUploadPublishPreviewCorrectionModal = false;
    try {
      const documentContainer = yield this.pieceInCreation.documentContainer;
      // TODO set document type publish preview
      yield documentContainer.save();
      yield this.savePiece.perform(this.pieceInCreation);
      const pieces = yield this.activityToAddPiecesTo.hasMany('generatedPieces').reload();
      pieces.pushObject(this.pieceInCreation);
      yield this.activityToAddPiecesTo.save();
    } catch (error) {
      yield this.deleteUploadedPiece.perform(this.pieceInCreation);
      throw error;
    }

    this.pieceInCreation = null;
    this.activityToAddPiecesTo = null;
    this.showLoader = false;
  }

  @task
  *savePublishPreviewCorrection() {
    this.showLoader = true;
    this.isOpenUploadPublishPreviewModal = false;
    try {
      const documentContainer = yield this.pieceInCreation.documentContainer;
      // TODO set document type publish preview
      yield documentContainer.save();
      yield this.savePiece.perform(this.pieceInCreation);
      const pieces = yield this.activityToAddPiecesTo.hasMany('generatedPieces').reload();
      pieces.pushObject(this.pieceInCreation);
      yield this.activityToAddPiecesTo.save();
    } catch (error) {
      yield this.deleteUploadedPiece.perform(this.pieceInCreation);
      throw error;
    }

    this.pieceInCreation = null;
    this.activityToAddPiecesTo = null;
    this.showLoader = false;
  }

  /**
   * Save a new document container and the piece it wraps
   */
  @task
  *savePiece(piece) {
    yield piece.save();
    // TODO do we want to save this to case pieces ? assuming yes
    const pieces = yield this.model.case.hasMany('pieces').reload();
    pieces.pushObject(piece);
    yield this.model.case.save();
  }

  @task
  *cancelUploadPieces() {
    if (this.pieceInCreation) {
      yield this.deleteUploadedPiece.perform(this.pieceInCreation);
    }
    this.pieceInCreation = null;
    this.activityToAddPiecesTo = null;
    this.isOpenUploadPublishPreviewModal = false;
  }

  @task
  *deleteUploadedPiece(piece) {
    const file = yield piece.file;
    yield file.destroyRecord();
    this.pieceInCreation = null;
    const documentContainer = yield piece.documentContainer;
    yield documentContainer.destroyRecord();
    yield piece.destroyRecord();
  }

  @action
  async cancelExistingPublishPreviewActivity() {
    alert('this action is implemented in another ticket');
  }

  @action
  addPublishPreview() {
    alert('this action is implemented in another ticket');
  }

  @action
  deletePublishPreview() {
    alert('this action is implemented in another ticket');
  }

  @action
  editPublishPreview() {
    alert('this action is implemented in another ticket');
  }

  @action
  addCorrection() {
    alert('this action is implemented in another ticket');
  }

  @action
  deleteCorrection() {
    alert('this action is implemented in another ticket');
  }

  @action
  editCorrection() {
    alert('this action is implemented in another ticket');
  }

  @action
  async showPieceViewer(piece) {
    window.open(`/document/${(await piece).get('id')}`);
  }
}
