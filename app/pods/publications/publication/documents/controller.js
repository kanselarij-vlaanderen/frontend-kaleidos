import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { all } from 'ember-concurrency';
import {
  action,
  set
} from '@ember/object';
import { inject as service } from '@ember/service';

export default class PublicationDocumentsController extends Controller {
  @service activityService;
  @service subcasesService;
  @service emailService;
  @service fileService;
  @service configService;
  @service store;

  @tracked showPieceUploadModal = false;
  @tracked showLoader = false;

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
  filterName = '';
  filterExtensions = [];
  filterDocumentTypeIds = [];

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

  // open piece upload modal
  @action
  openPieceUploadModal() {
    this.showPieceUploadModal = true;
  }

  @task
  *saveAndLinkPieces(pieces) {
    const savePromises = pieces.map(async(piece) => {
      piece.cases = [this.case];
      const documentContainer = await piece.documentContainer;
      await documentContainer.save();
      return piece.save();
    });
    yield all(savePromises);
    this.showPieceUploadModal = false;
    this.send('refresh'); // only required because of "inverse: null" on piece-cases relationship.
  }

  @action
  hidePieceUploadModal() {
    this.showPieceUploadModal = false;
  }

  // document menu options
  // - option: view
  @action
  showPieceViewer(pieceId) {
    window.open(`/document/${pieceId}`);
  }

  // - option: edit
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
    await this.pieceBeingEdited.save();
    const dc = await this.pieceBeingEdited.get('documentContainer');
    await dc.save();
    this.send('refresh');
  }

  // - option: delete
  @action
  deleteExistingPiece(piece) {
    this.pieceToDelete = piece;
    this.isVerifyingDelete = true;
  }

  @action
  cancelDeleteExistingPiece() {
    this.pieceToDelete = null;
    this.isVerifyingDelete = false;
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
  setFilter(filter) {
    set(this, 'filterName', filter.documentName);
    set(this, 'filterDocumentTypeIds', filter.documentTypes.map((it) => it.id));
    set(this, 'filterExtensions', filter.fileTypes);
  }
}
