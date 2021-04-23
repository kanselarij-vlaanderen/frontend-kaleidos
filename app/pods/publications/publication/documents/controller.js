import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { all } from 'ember-concurrency';
import { A } from '@ember/array';
import EmberObject, { action } from '@ember/object';
// import CONFIG from 'frontend-kaleidos/utils/config';
import { inject as service } from '@ember/service';
import moment from 'moment';
import DocumentsFilter from 'frontend-kaleidos/utils/documents-filter';
import { sortPieces } from 'frontend-kaleidos/utils/documents';

export default class PublicationDocumentsController extends Controller {
  @service activityService;
  @service subcasesService;
  @service emailService;
  @service fileService;
  @service configService;
  @service store;

  @tracked isLoaded = false;
  @tracked isOpenPieceUploadModal = false;
  @tracked isOpenTranslationRequestModal = false;
  @tracked isOpenPublishPreviewRequestModal = false;
  @tracked newPieces = A([]);
  @tracked isExpandedPieceView = false;
  @tracked isSavingPieces = false;
  @tracked isExpanded = false;
  @tracked showLoader = false;
  @tracked showTranslationModal = false;
  @tracked showFilterPanel = true;
  @tracked filteredSortedPieces = [];

  @tracked translateActivity = {
    mailContent: '',
    mailSubject: '',
    finalTranslationDate: '',
    pieces: [],
  };
  @tracked previewActivity = {
    mailContent: '',
    mailSubject: '',
    pieces: [],
  };
  @tracked selectedPieces = [];
  @tracked pieceToDelete = null;
  @tracked isVerifyingDelete = false;

  // Editing of pieces.
  @tracked pieceBeingEdited = null;
  @tracked showPieceEditor = false;

  // Hacky way to refresh the checkboxes in the view without reloading the route.
  @tracked renderPieces = true;

  @tracked filter;
  filterQueryParams = EmberObject.create();

  async setup(
    {
      _case,
    },
    filter,
    reloadModel
  ) {
    this.case = _case;
    this.reloadModel = reloadModel;
    this.filter = new DocumentsFilter(filter);
    console.log(this.filter);
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

  /** temporarily disabled
  // PUBLISH PREVIEW ACTIVITIES
  @action
  setPreviewMailSubject(event) {
    set(this.previewActivity, 'mailSubject', event.target.value);
  }

  @action
  async openPublishPreviewRequestModal() {
    set(this.previewActivity, 'pieces', this.selectedPieces);
    const subject = await this.getConfig('email:publishPreviewRequest:subject', CONFIG.mail.publishPreviewRequest.subject);
    const content = await this.getConfig('email:publishPreviewRequest:content', CONFIG.mail.publishPreviewRequest.content);
    set(this.previewActivity, 'mailContent', await this.activityService.replaceTokens(content, this.model.publicationFlow, this.model.case));
    set(this.previewActivity, 'mailSubject', await this.activityService.replaceTokens(subject, this.model.publicationFlow, this.model.case));
    this.isOpenPublishPreviewRequestModal = true;
  }

  @action
  cancelPublishPreviewRequestModal() {
    set(this.previewActivity, 'mailContent', '');
    set(this.previewActivity, 'mailSubject', '');
    this.isOpenPublishPreviewRequestModal = false;
  }

  @action
  async savePublishPreviewActivity() {
    this.showLoader = true;
    this.isOpenPublishPreviewRequestModal = false;
    this.previewActivity.pieces = this.selectedPieces;

    // publishPreviewActivityType.
    const publishPreviewSubCaseType = await this.store.findRecord('subcase-type', CONFIG.SUBCASE_TYPES.drukproef.id);

    // TODO take from other subcase maybe?
    const shortTitle = await this.model.case.shortTitle;
    const title = await this.model.case.title;

    // Find or Create subase.
    const subcase = await this.subcasesService.findOrCreateSubcaseFromTypeInPublicationFlow(publishPreviewSubCaseType, this.model.publicationFlow, title, shortTitle);

    // Create activity in subcase.
    this.renderPieces = false;
    await this.activityService.createNewPublishPreviewActivity(this.previewActivity.mailContent, this.previewActivity.mailSubject, this.previewActivity.pieces, subcase);

    // Send email
    this.emailService.sendEmail(CONFIG.EMAIL.DEFAULT_FROM, CONFIG.EMAIL.TO.publishpreviewEmail, this.previewActivity.mailSubject, this.previewActivity.mailContent, this.previewActivity.pieces);

    // Visual stuff.
    this.selectedPieces = [];

    // Reset local activity to empty state.
    this.previewActivity = {
      mailContent: '',
      mailSubject: '',
      pieces: A([]),
    };
    this.showLoader = false;
    this.renderPieces = true;
    this.model.refreshAction();
  }

  // TRANSLATION ACTIVITIES
  @action
  setTranslationMailSubject(event) {
    set(this.translateActivity, 'mailSubject', event.target.value);
  }

  @action
  async openTranslationRequestModal() {
    this.translateActivity.finalTranslationDate = ((this.model.publicationFlow.translateBefore) ? this.model.publicationFlow.translateBefore : new Date());
    this.translateActivity.pieces = this.selectedPieces;
    const subject = await this.getConfig('email:translationRequest:subject', CONFIG.mail.translationRequest.subject);
    const content = await this.getConfig('email:translationRequest:content', CONFIG.mail.translationRequest.content);
    set(this.translateActivity, 'mailContent', await this.activityService.replaceTokens(content, this.model.publicationFlow, this.model.case));
    set(this.translateActivity, 'mailSubject', await this.activityService.replaceTokens(subject, this.model.publicationFlow, this.model.case));
    this.showTranslationModal = true;
  }

  get getTranslateActivityBeforeDate() {
    if (this.model.publicationFlow.translateBefore) {
      return this.model.publicationFlow.translateBefore;
    }
    return new Date();
  }

  @action
  async saveTranslationActivity() {
    this.showLoader = true;
    this.showTranslationModal = false;

    // Fetch the type.
    const translateSubCaseType = await this.store.findRecord('subcase-type', CONFIG.SUBCASE_TYPES.vertalen.id);

    // TODO take from other subcase maybe?
    const shortTitle = await this.model.case.shortTitle;
    const title = await this.model.case.title;

    // Find or Create subase.
    const subcase = await this.subcasesService.findOrCreateSubcaseFromTypeInPublicationFlow(translateSubCaseType, this.model.publicationFlow, title, shortTitle);

    // Create activity in subcase.
    await this.activityService.createNewTranslationActivity(this.translateActivity.finalTranslationDate, this.translateActivity.mailContent, this.translateActivity.mailSubject, this.translateActivity.pieces, subcase);

    // Send the email
    this.emailService.sendEmail(CONFIG.EMAIL.DEFAULT_FROM, CONFIG.EMAIL.TO.translationsEmail, this.translateActivity.mailSubject, this.translateActivity.mailContent, this.translateActivity.pieces);

    // Visual stuff.
    this.selectedPieces = [];

    // Reset local activity to empty state.
    this.translateActivity = {
      mailContent: '',
      mailSubject: '',
      finalTranslationDate: '',
      pieces: A([]),
    };
    this.showLoader = false;
    this.renderPieces = true;
    this.model.refreshAction();
  }

  @action
  cancelTranslationModal() {
    set(this.translateActivity, 'mailContent', '');
    set(this.translateActivity, 'mailSubject', '');
    this.showTranslationModal = false;
  }

  @action
  setTranslateActivityBeforeDate(dates) {
    this.translateActivity.finalTranslationDate = dates[0];
  }

  async getConfig(name, defaultValue) {
    return await this.configService.get(name, defaultValue);
  }
  */

  @action
  async toggleFilterPanel() {
    this.showFilterPanel = !this.showFilterPanel;
  }

  @action
  async onPerformFilter(filter) {
    this.renderPieces = false;
    this.selectedPieces = [];
    this.filter = filter;
    this.filterQueryParams.set('documentTypes', this.filter.documentTypes.map((it) => it.id).join(','));
    this.reloadModel();
    // await this.sortAndFilterPieces();
    this.renderPieces = true;
  }

  async sortAndFilterPieces() {
    this.showLoader = true;
    const sortedPieces = sortPieces(this.model);
    this.filteredSortedPieces = [];
    for (let index = 0; index < sortedPieces.length; index++) {
      const piece = sortedPieces[index];
      // sync filter first
      if (!this.filterTitle(piece)) {
        continue;
      }
      if (!await this.filterFileType(piece)) {
        continue;
      }
      if (!await this.filterPieceType(piece)) {
        continue;
      }
      this.filteredSortedPieces.pushObject(piece);
    }
    this.showLoader = false;
  }

  filterTitle(piece) {
    return piece.name.toLowerCase().includes(this.filter.documentName.toLowerCase());
  }

  async filterFileType(piece) {
    // Als we geen types hebben geselecteerd, laten we alles zien.
    if (this.filter.fileTypes.length === 0) {
      return true;
    }

    const ext = await piece.get('file.extension');
    if (!ext) {
      return false;
    }
    return this.filter.fileTypes.includes(ext);
  }

  async filterPieceType(piece) {
    // Als we geen types hebben geselecteerd, laten we alles zien.
    if (this.filter.documentTypes.length === 0) {
      return true;
    }

    const typeId = await piece.get('documentContainer.type.id');
    if (!typeId) {
      return false;
    }
    return this.filter.documentTypes.some((type) => type.id === typeId);
  }

  _resetFilterState() {
    this.filter.reset();
    this.selectedPieces = [];
  }
}
