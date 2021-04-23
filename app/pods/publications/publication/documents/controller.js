import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { all } from 'ember-concurrency';
import { A } from '@ember/array';
import { action } from '@ember/object';
// import CONFIG from 'frontend-kaleidos/utils/config';
import { inject as service } from '@ember/service';
import moment from 'moment';
import DocumentsFilter from 'frontend-kaleidos/utils/documents-filter';
import { sortPieces } from 'frontend-kaleidos/utils/documents';
import FilterQueryParams from './filter-query-params';

export default class PublicationDocumentsController extends Controller {
  @service activityService;
  @service subcasesService;
  @service emailService;
  @service fileService;
  @service configService;
  @service store;

  @tracked isLoaded = false;
  @tracked isOpenPieceUploadModal = false;
  @tracked newPieces = A([]);
  @tracked isExpandedPieceView = false;
  @tracked isSavingPieces = false;
  @tracked isExpanded = false;
  @tracked showLoader = false;
  @tracked showFilterPanel = true;
  @tracked filteredSortedPieces = [];

  @tracked documentTypes;
  @tracked selectedPieces = [];
  @tracked pieceToDelete = null;
  @tracked isVerifyingDelete = false;

  // Editing of pieces.
  @tracked pieceBeingEdited = null;
  @tracked showPieceEditor = false;

  // Hacky way to refresh the checkboxes in the view without reloading the route.
  @tracked renderPieces = true;

  @tracked filter;
  // It would be cleaner in a separate object, but Ember requires the queryParams on the controller
  @tracked filterQueryParams$documentName = '';
  @tracked filterQueryParams$fileTypes = '';
  @tracked filterQueryParams$documentTypes = '';

  // eslint-disable-next-line object-curly-newline
  async setup({ _case, documentTypes, }, filter) {
    this.case = _case;
    this.documentTypes = documentTypes;

    this.filter = new DocumentsFilter(filter);
    await this.sortAndFilterPieces();

    this.isLoaded = true;
  }

  // called from route (to share logic)
  reset() {
    this._resetFilterState();
    this.isLoaded = false;
  }

  get areAllPiecesSelected() {
    return this.filteredSortedPieces.length === this.selectedPieces.length;
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
      this.selectedPieces = [...this.filteredSortedPieces];
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
    yield this.sortAndFilterPieces();
    this.showLoader = false;
    this.newPieces = A();
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
    const documentContainer = await this.pieceBeingEdited.documentContainer;
    if (documentContainer) {
      documentContainer.rollbackAttributes();
      documentContainer.belongsTo('type').reload();
    }
    this.pieceBeingEdited = null;
    this.showPieceEditor = false;
  }

  @action
  async saveEditedPiece() {
    this.showPieceEditor = false;
    this.showLoader = true;
    await this.pieceBeingEdited.save();
    const documentContainer = await this.pieceBeingEdited.documentContainer;
    await documentContainer.save();
    this.showLoader = false;
  }

  @action
  deleteExistingPiece(piece) {
    this.pieceToDelete = piece;
    this.isVerifyingDelete = true;
  }

  @task
  *verifyDeleteExistingPiece() {
    const agendaitems = yield this.pieceToDelete.agendaitems;
    // TODO reverse if else, do we need the else in this case ?
    if (agendaitems && agendaitems.length > 0) {
      // Possible unreachable code, failsafe. Do we want to show a toast ?
    } else {
      // TODO delete with undo ?
      this.showLoader = true;
      this.isVerifyingDelete = false;
      const documentContainer = yield this.pieceToDelete.documentContainer;
      const piecesFromContainer = yield documentContainer.pieces;
      if (piecesFromContainer.length < 2) {
        // Cleanup documentContainer if we are deleting the last piece in the container
        // Must revise if we link docx and pdf as multiple files in 1 piece
        yield this.fileService.deleteDocumentContainer(documentContainer);
      } else {
        yield this.fileService.deletePiece(this.pieceToDelete);
      }
      this.model.removeObject(this.pieceToDelete);
      yield this.sortAndFilterPieces();
      this.showLoader = false;
      this.pieceToDelete = null;
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

  async sortAndFilterPieces() {
    this.showLoader = true;
    const sortedPieces = sortPieces(this.model);

    // Als we geen types hebben geselecteerd, laten we alles zien.
    if (!this.filter.fileTypes.length) {
      this.filteredSortedPieces = sortedPieces;
    } else {
      // Filtering of file extensions is not yet possible in the backend, so we do it here.
      const filteredSortedPieces = [];
      for (const piece of sortedPieces) {
        if (!await this.filterFileType(piece)) {
          continue;
        }
        filteredSortedPieces.push(piece);
      }

      this.filteredSortedPieces = filteredSortedPieces;
    }

    this.showLoader = false;
  }

  async filterFileType(piece) {
    const ext = await piece.get('file.extension');
    if (!ext) {
      return false;
    }
    return this.filter.fileTypes.includes(ext);
  }

  _resetFilterState() {
    this.filter.reset();
    FilterQueryParams.updateFromFilterAndReload(this, this.filter);
    this.selectedPieces = [];
  }
}
