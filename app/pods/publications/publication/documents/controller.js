import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';
import { all } from 'ember-concurrency';
import { A } from '@ember/array';
import moment from 'moment';

export default class PublicationDocumentsController extends Controller {
  @tracked isOpenPieceUploadModal = false;
  @tracked isOpenTranslationRequestModal = false;
  @tracked isOpenPublishPreviewRequestModal = false;
  @tracked newPieces = A([]);
  @tracked isExpandedPieceView = false;
  @tracked isSavingPieces = false;
  @tracked showLoader = false;
  @tracked showTranslationModal = false;
  @tracked translateActivity = {
    mailContent: '',
    finalTranslationDate: '',
    pieces: [],
  };
  @tracked selectedPieces = [];

  @action
  changePieceSelection(selectedPiece) {
    const index = this.selectedPieces.map((piece, index) => {
      if (piece.id === selectedPiece.id) {
        return index;
      }
    });
    if (index.length > 0) {
      this.selectedPieces.splice(index[0], 1);
    } else {
      this.selectedPieces.push(selectedPiece);
    }
  }

  @action
  openPieceUploadModal() {
    this.isOpenPieceUploadModal = true;
  }

  @action
  openPublishPreviewRequestModal() {
    alert('Deze functionaliteit heeft nog geen implementatie');
    // this.isOpenPublishPreviewRequestModal = true;
  }

  @action
  // eslint-disable-next-line class-methods-use-this
  showPieceViewer(pieceId) {
    window.open(`/document/${pieceId}`);
  }

  @action
  toggleFolderCollapse(piece) {
    piece.set('collapsed', !piece.collapsed);
  }

  @action
  uploadPiece(file) {
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
    this.newPieces.pushObject(piece);
  }

  @task
  *savePieces() {
    const savePromises = this.newPieces.map(async(piece) => {
      try {
        this.savePiece.perform(piece);
      } catch (error) {
        this.deletePiece.perform(piece);
        throw error;
      }
    });
    yield all(savePromises);
    this.isOpenPieceUploadModal = false;
    this.newPieces = A();
  }

  /**
   * Save a new document container and the piece it wraps
   */
  @task
  *savePiece(piece) {
    const documentContainer = yield piece.documentContainer;
    yield documentContainer.save();
    yield piece.save();
    const pieces = yield this.model.case.hasMany('pieces').reload();
    pieces.pushObject(piece);
    yield this.model.case.save();
  }

  @task
  *cancelUploadPieces() {
    const deletePromises = this.newPieces.map((piece) => this.deletePiece.perform(piece));
    yield all(deletePromises);
    this.newPieces = A();
    this.isOpenPieceUploadModal = false;
  }

  @task
  *deletePiece(piece) {
    const file = yield piece.file;
    yield file.destroyRecord();
    this.newPieces.removeObject(piece);
    const documentContainer = yield piece.documentContainer;
    yield documentContainer.destroyRecord();
    yield piece.destroyRecord();
  }


  /** TRANSLATION ACTIVITIES **/

  @action
  openTranslationRequestModal() {
    this.translateActivity.finalTranslationDate = this.model.publicationFlow.translateBefore;
    this.translateActivity.pieces = this.selectedPieces;
    this.showTranslationModal = true;
  }

  get getTranslateActivityBeforeDate() {
    console.log(this.model.publicationFlow.translateBefore);
    if (this.model.publicationFlow.translateBefore) {
      return this.model.publicationFlow.translateBefore;
    }
    return new Date();
  }

  @action
  saveTranslationActivity() {
    this.showLoader = true;
    this.showTranslationModal = false;
    console.log(this.translateActivity);
    // Aanmaken subcase type vertaling in publication flow
    // Create activity
    this.showLoader = false;
    this.selectedPieces = [];
  }

  @action
  cancelTranslationModal() {
    this.showTranslationModal = false;
  }

  @action
  setTranslateActivityBeforeDate(dates) {
    console.log(dates);
    this.translateActivity.finalTranslationDate = dates[0];
  }
}
