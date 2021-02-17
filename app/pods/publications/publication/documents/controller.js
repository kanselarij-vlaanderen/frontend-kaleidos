import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { all } from 'ember-concurrency';
import { A } from '@ember/array';
import CONFIG from 'fe-redpencil/utils/config';
import { inject as service } from '@ember/service';
import moment from 'moment';
import {
  action,
  set,
  computed
} from '@ember/object';

export default class PublicationDocumentsController extends Controller {
  @service activityService;
  @service subcasesService;
  @service emailService;
  @service fileService;
  @service store;

  @tracked selectedAll = false;
  @tracked isOpenPieceUploadModal = false;
  @tracked isOpenTranslationRequestModal = false;
  @tracked isOpenPublishPreviewRequestModal = false;
  @tracked newPieces = A([]);
  @tracked isExpandedPieceView = false;
  @tracked isSavingPieces = false;
  @tracked isExpanded = false;
  @tracked showLoader = false;
  @tracked showTranslationModal = false;
  @tracked filteredSortedPieces = A([]);
  @tracked documentTypes = [];


  @tracked translateActivity = {
    @tracked mailContent: '',
    @tracked mailSubject: '',
    @tracked finalTranslationDate: '',
    @tracked pieces: A([]),
  };
  @tracked previewActivity = {
    @tracked mailContent: '',
    @tracked mailSubject: '',
    @tracked pieces: A([]),
  };
  @tracked selectedPieces = A([]);
  @tracked pieceToDelete = null;
  @tracked isVerifyingDelete = false;

  // Editing of pieces.
  @tracked pieceBeingEdited = null;
  @tracked showPieceEditor = false;

  // Hacky way to refresh the checkboxes in the view without reloading the route.
  @tracked renderPieces = true;

  @tracked fileExtensions = [];
  @tracked filterIsActive = false;
  @tracked pieceName = '';
  @tracked selectedFileExtensions = [];
  @tracked selectedPieceTypes = [];

  concatNames(pieces) {
    return pieces.map((piece) => piece.name).join('\n');
  }

  constructor() {
    super(...arguments);
    this.loadData.perform();
    this.loadExtensionData.perform();
  }

  @task
  *loadData() {
    if (!this.documentTypes.length) {
      this.documentTypes = yield this.store.query('document-type', {
        page: {
          size: 50,
        },
      });
    }
  }

  @task
  *loadExtensionData() {
    if (!this.fileExtensions.length) {
      this.fileExtensions = yield this.fileService.getFileExtensions();
    }
  }

  get sortedDocumentTypes() {
    return this.documentTypes.sortBy('priority');
  }

  @action
  toggleUploadModalSize() {
    this.isExpanded = !this.isExpanded;
  }

  @action
  changePieceSelection(selectedPiece) {
    const tempPieces = [...this.filteredSortedPieces];
    const tempSelectedPiece = tempPieces.find((piece) => piece.id === selectedPiece.id);

    set(tempSelectedPiece, 'selectedForPublicationActivity', !selectedPiece.selectedForPublicationActivity);

    const foundPiece = this.selectedPieces.find((piece) => piece.id === selectedPiece.id);

    if (foundPiece) {
      this.selectedPieces.removeObject(selectedPiece);
    } else {
      this.selectedPieces.pushObject(selectedPiece);
    }
    this.filteredSortedPieces = tempPieces;
  }

  @action selectAllDocuments() {
    this.selectedAll = !this.selectedAll;

    if (this.selectedAll) {
      this.filteredSortedPieces.forEach((piece) => set(piece, 'selectedForPublicationActivity', true));
      this.selectedPieces = this.filteredSortedPieces;
    } else {
      this.filteredSortedPieces.forEach((piece) => set(piece, 'selectedForPublicationActivity', false));
      this.selectedPieces = A([]);
    }
  }

  @action
  openPieceUploadModal() {
    this.isOpenPieceUploadModal = true;
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
        await this.savePiece.perform(piece);
      } catch (error) {
        await this.deleteUploadedPiece.perform(piece);
        throw error;
      }
    });
    this.showLoader = true;
    this.isOpenPieceUploadModal = false;
    yield all(savePromises);
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
    yield piece.save();
    const pieces = yield this.model.case.hasMany('pieces').reload();
    pieces.pushObject(piece);
    yield this.model.case.save();
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
    this.showLoader = false;
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
      yield this.model.case.hasMany('pieces').reload();
      this.showLoader = false;
      this.pieceToDelete = null;
    }
  }

  /** PUBLISH PREVIEW ACTIVITIES **/
  @action
  setMailSubject(event) {
    set(this.previewActivity, 'mailSubject', event.target.value);
  }

  @action
  async openPublishPreviewRequestModal() {
    set(this.previewActivity, 'pieces', this.selectedPieces);
    set(this.previewActivity, 'mailContent', this.activityService.replaceTokens(CONFIG.mail.publishPreviewRequest.content, this.model.publicationFlow, this.model.case));
    set(this.previewActivity, 'mailSubject', this.activityService.replaceTokens(CONFIG.mail.publishPreviewRequest.subject, this.model.publicationFlow, this.model.case));
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
    this.selectedPieces = A([]);

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

  /** TRANSLATION ACTIVITIES **/

  @action
  async openTranslationRequestModal() {
    this.translateActivity.finalTranslationDate = ((this.model.publicationFlow.translateBefore) ? this.model.publicationFlow.translateBefore : new Date());
    this.translateActivity.pieces = this.selectedPieces;
    set(this.translateActivity, 'mailContent', this.activityService.replaceTokens(CONFIG.mail.translationRequest.content, this.model.publicationFlow, this.model.case));
    set(this.translateActivity, 'mailSubject', this.activityService.replaceTokens(CONFIG.mail.translationRequest.subject, this.model.publicationFlow, this.model.case));
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
    this.selectedPieces = A([]);

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

  @action
  onFilterByPieceNameNameChange(event) {
    this.pieceName = event.target.value;
  }

  @action
  async resetFilter() {
    this.selectedFileExtensions = [];
    this.selectedPieceTypes = [];
    this.pieceName = '';
    this.renderPieces = false;
    this.selectedPieces = A([]);
    this.selectedAll = false;
    await this.sortedFilteredPieces();
    this.renderPieces = true;
  }

  @computed('model.case.sortedPieces')
  get initialDocumentLoad() {
    this.sortedFilteredPieces();
    return true;
  }

  @action
  async filterDocumentsAction() {
    this.renderPieces = false;
    this.selectedAll = false;
    this.selectedPieces = A([]);
    await this.sortedFilteredPieces();
    this.renderPieces = true;
  }

  async sortedFilteredPieces() {
    this.showLoader = true;
    const filteredPieces =  [...this.model.case.sortedPieces];
    filteredPieces.forEach((piece) => set(piece, 'selectedForPublicationActivity', false));
    this.filteredSortedPieces = null;
    this.filteredSortedPieces = A([]);

    for (let index = 0; index < filteredPieces.length; index++) {
      const piece = filteredPieces[index];
      if (!await this.fileTypeAllowed(piece)) {
        continue;
      }
      if (!await this.pieceTypeAllowed(piece)) {
        continue;
      }

      if (!this.filterTitle(piece)) {
        continue;
      }
      this.filteredSortedPieces.pushObject(piece);
    }
    this.showLoader = false;
  }

  filterTitle(piece) {
    return piece.name.toLowerCase().includes(this.pieceName.toLowerCase());
  }

  async fileTypeAllowed(piece) {
    // Als we geen types hebben geselecteerd, laten we alles zien.
    if (this.selectedFileExtensions.length === 0) {
      return true;
    }
    const file = await piece.get('file');
    const ext = await file.get('extension');
    return this.selectedFileExtensions.includes(ext);
  }

  async pieceTypeAllowed(piece) {
    // Als we geen types hebben geselecteerd, laten we alles zien.
    if (this.selectedPieceTypes.length === 0) {
      return true;
    }
    const container = await piece.get('documentContainer');
    if (container) {
      const containerType = await container.get('type');
      if (containerType) {
        const typeId = await containerType.get('id');
        const listOfTypeIds = this.selectedPieceTypes.map((type) => type.id);
        return listOfTypeIds.includes(typeId);
      }
      return false;
    }
    return false;
  }
}
