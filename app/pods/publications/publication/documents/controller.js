import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { all } from 'ember-concurrency';
import { A } from '@ember/array';
import CONFIG from 'fe-redpencil/utils/config';
import { inject as service } from '@ember/service';
import moment from 'moment';
import EmberObject, { action } from '@ember/object';

export default class PublicationDocumentsController extends Controller {
  @service activityService;
  @service subcasesService;
  @tracked isOpenPieceUploadModal = false;
  @tracked isOpenTranslationRequestModal = false;
  @tracked isOpenPublishPreviewRequestModal = false;
  @tracked newPieces = A([]);
  @tracked isExpandedPieceView = false;
  @tracked isSavingPieces = false;
  @tracked isUploadModalResized = false;
  @tracked showLoader = false;
  @tracked showTranslationModal = false;
  @tracked translateActivity = {
    mailContent: '',
    finalTranslationDate: '',
    pieces: [],
  };
  @tracked selectedPieces = [];
  @tracked currentPieces = this.pieces;

  get pieces() {
    if (this.model.case.pieces) {
      return this.model.case.pieces.toArray();
    }
    return null;
  }

  @action
  toggleUploadModalSize() {
    this.isUploadModalResized = !this.isUploadModalResized;
  }

  getPieceFromSelectedPieces(piece) {
    return this.selectedPieces[piece.id];
  }

  @action
  changePieceSelection(selectedPiece) {
    console.log('changePieceSelection');
    if (this.selectedPieces[selectedPiece.id]) {
      delete this.selectedPieces[selectedPiece.id];
      selectedPiece.selected = false;
    } else {
      this.selectedPieces[selectedPiece.id] = selectedPiece;
      selectedPiece.selected = true;
    }
    console.log('piece', this.model.case.pieces.toArray());
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
  async saveTranslationActivity() {
    this.showLoader = true;
    this.showTranslationModal = false;
    const translateSubCaseType = EmberObject.create({
      id: CONFIG.SUBCASE_TYPES.vertalen.id,
      uri: CONFIG.SUBCASE_TYPES.vertalen.url,
    });

    // TODO take from other subcase maybe?
    const shortTitle = await this.model.case.shortTitle;
    const title = await this.model.case.title;

    // Create subase.
    const subcase = await this.subcasesService.createSubcaseForPublicationFlow(this.model.case, this.model.publicationFlow, translateSubCaseType, shortTitle, title);

    // Create activity in subcase.
    await this.activityService.createNewTranslationActivity(this.translateActivity.finalTranslationDate, this.translateActivity.mailContent, this.translateActivity.pieces, subcase);

    // Visual stuff.
    this.showLoader = false;
    this.currentPieces.forEach((piece) => {
      piece.selected = false;
    });
    this.currentPieces = [...this.currentPieces];

    // Reset local activity to empty state.
    this.translateActivity = {
      mailContent: '',
      finalTranslationDate: '',
      pieces: [],
    };
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
