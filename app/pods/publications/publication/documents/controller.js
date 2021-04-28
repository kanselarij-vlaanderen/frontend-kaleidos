import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { all } from 'ember-concurrency';
import { A } from '@ember/array';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import moment from 'moment';
import FilterQueryParams from './filter-query-params';

export default class PublicationDocumentsController extends Controller {
  @service activityService;
  @service subcasesService;
  @service emailService;
  @service fileService;
  @service configService;
  @service store;

  @tracked isOpenPieceUploadModal = false;
  @tracked newPieces = A([]);
  @tracked isExpandedPieceView = false;
  @tracked isSavingPieces = false;
  @tracked isExpanded = false;
  @tracked showLoader = false;

  @tracked documentTypes;
  @tracked selectedPieces = [];
  @tracked pieceToDelete = null;
  @tracked isVerifyingDelete = false;

  // Editing of pieces.
  @tracked pieceBeingEdited = null;
  @tracked showPieceEditor = false;

  // Hacky way to refresh the checkboxes in the view without reloading the route.
  @tracked renderPieces = true;

  @tracked showFilterPanel = true;
  @tracked filter;

  // no @tracked for performance
  // necessary to make parameter defaults not appear in the url
  filterQueryParams$documentName = '';
  filterQueryParams$fileTypes = [];
  filterQueryParams$documentTypes = [];

  get areAllPiecesSelected() {
    return this.model.length === this.selectedPieces.length;
  }

  @action
  changePieceSelection(selectedPiece) {
    const isPieceSelected = this.selectedPieces.includes(selectedPiece);

    if (isPieceSelected) {
      this.selectedPieces.removeObject(selectedPiece);
    } else {
      this.selectedPieces.pushObject(selectedPiece);
    }
  }

  @action
  changeAllPiecesSelection() {
    if (this.areAllPiecesSelected) {
      this.selectedPieces = [];
    } else {
      this.selectedPieces = [...this.model];
    }
  }

  @action
  openPieceUploadModal() {
    this.isOpenPieceUploadModal = true;
  }

  @action
  toggleUploadModalSize() {
    this.isExpanded = !this.isExpanded;
  }

  @action
  showPieceViewer(pieceId) {
    window.open(`/document/${pieceId}`);
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
        await this.savePiece.perform(piece);
      } catch (error) {
        await this.deleteUploadedPiece.perform(piece);
        throw error;
      }
    });
    this.showLoader = true;
    this.isOpenPieceUploadModal = false;
    yield all(savePromises);
    this.send('refresh');
  }

  /**
   * Save a new document container and the piece it wraps
   */
  @task
  *savePiece(piece) {
    const documentContainer = yield piece.documentContainer;
    yield documentContainer.save();
    this.model.pushObject(piece);
    piece.cases.pushObject(this.case);
    yield piece.save();
  }

  @task
  *cancelUploadPieces() {
    this.showLoader = true;
    const deletePromises = this.newPieces.map((piece) => this.deleteUploadedPiece.perform(piece));
    yield all(deletePromises);
    this.newPieces = A();
    this.isOpenPieceUploadModal = false;
    this.showLoader = false;
  }

  @task
  *deleteUploadedPiece(piece) {
    const file = yield piece.file;
    yield file.destroyRecord();
    this.newPieces.removeObject(piece);
    const documentContainer = yield piece.documentContainer;
    yield documentContainer.destroyRecord();
    yield piece.destroyRecord();
  }

  @action
  cancelDeleteExistingPiece() {
    this.pieceToDelete = null;
    this.isVerifyingDelete = false;
  }

  @action
  async editExistingPiece(piece) {
    this.pieceBeingEdited = piece;
    this.showPieceEditor = true;
  }

  @action
  async cancelEditPiece() {
    this.pieceBeingEdited.rollbackAttributes();
    const dc = await this.pieceBeingEdited.get('documentContainer');
    if (dc) {
      dc.rollbackAttributes();
      dc.belongsTo('type').reload();
    }
    this.pieceBeingEdited = null;
    this.showPieceEditor = false;
  }

  @action
  async saveEditedPiece() {
    this.showPieceEditor = false;
    this.showLoader = true;
    await this.pieceBeingEdited.save();
    const dc = await this.pieceBeingEdited.get('documentContainer');
    await dc.save();
    this.send('refresh');
  }

  @action
  deleteExistingPiece(piece) {
    this.pieceToDelete = piece;
    this.isVerifyingDelete = true;
  }

  @task
  *verifyDeleteExistingPiece() {
    const agendaitems = yield this.pieceToDelete.get('agendaitems');
    // TODO reverse if else, do we need the else in this case ?
    if (agendaitems && agendaitems.length > 0) {
      // Possible unreachable code, failsafe. Do we want to show a toast ?
    } else {
      // TODO delete with undo ?
      this.showLoader = true;
      this.isVerifyingDelete = false;
      const documentContainer = yield this.pieceToDelete.get('documentContainer');
      const piecesFromContainer = yield documentContainer.get('pieces');
      if (piecesFromContainer.length < 2) {
        // Cleanup documentContainer if we are deleting the last piece in the container
        // Must revise if we link docx and pdf as multiple files in 1 piece
        yield this.fileService.deleteDocumentContainer(documentContainer);
      } else {
        yield this.fileService.deletePiece(this.pieceToDelete);
      }
      this.send('refresh');
    }
  }

  @action
  openTranslationRequestModal() {
    alert('Not implemented yet.');
  }

  @action
  openPublishPreviewRequestModal() {
    alert('Not implemented yet.');
  }

  @action
  async toggleFilterPanel() {
    this.showFilterPanel = !this.showFilterPanel;
  }

  @action
  async onPerformFilter(filter) {
    FilterQueryParams.updateFromFilterAndReload(this, filter);
  }
}
