import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { A } from '@ember/array';
import CONFIG from 'frontend-kaleidos/utils/config';
import { inject as service } from '@ember/service';
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
  @service configService;
  @service store;

  @tracked isOpenPieceUploadModal = false;
  @tracked isOpenTranslationRequestModal = false;
  @tracked isOpenPublishPreviewRequestModal = false;
  @tracked filteredSortedPieces = [];
  @tracked documentTypes = [];

  @tracked translateActivity = {
    /* @tracked*/ mailContent: '',
    /* @tracked*/ mailSubject: '',
    /* @tracked*/ finalTranslationDate: '',
    /* @tracked*/ pieces: A([]),
  };
  @tracked previewActivity = {
    /* @tracked*/ mailContent: '',
    /* @tracked*/ mailSubject: '',
    /* @tracked*/ pieces: A([]),
  };
  @tracked selectedPieces = [];
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

  constructor() {
    super(...arguments);
    this.loadData.perform();
    this.loadExtensionData.perform();
  }

  reset() {
    this._resetFilterState();
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

  // open piece upload modal
  @action
  openPieceUploadModal() {
    this.isOpenPieceUploadModal = true;
  }

  @action
  async onSave(pieces) {
    this.isOpenPieceUploadModal = false;
    this.model.case.pieces.pushObjects(pieces);
    await this.model.case.save();
  }

  @action
  onCancel() {
    this.isOpenPieceUploadModal = false;
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
      yield this.model.case.hasMany('pieces').reload();
      this.showLoader = false;
      this.pieceToDelete = null;
    }
  }

  /** PUBLISH PREVIEW ACTIVITIES **/
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

  /** TRANSLATION ACTIVITIES **/
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

  @action
  onFilterByPieceNameNameChange(event) {
    this.pieceName = event.target.value;
  }

  @action
  async resetFilter() {
    this._resetFilterState();
    await this.sortAndFilterPieces();
    this.renderPieces = true;
  }

  @computed('model.case.sortedPieces')
  get initialDocumentLoad() {
    this.sortAndFilterPieces();
    return true;
  }

  @action
  async filterDocumentsAction() {
    this.renderPieces = false;
    this.selectedPieces = [];
    await this.sortAndFilterPieces();
    this.renderPieces = true;
  }

  async getConfig(name, defaultValue) {
    return await this.configService.get(name, defaultValue);
  }

  async sortAndFilterPieces() {
    this.showLoader = true;
    const filteredPieces =  [...this.model.case.sortedPieces];
    this.filteredSortedPieces = [];
    for (let index = 0; index < filteredPieces.length; index++) {
      const piece = filteredPieces[index];
      if (!await this.filterFileType(piece)) {
        continue;
      }
      if (!await this.filterPieceType(piece)) {
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

  async filterFileType(piece) {
    // Als we geen types hebben geselecteerd, laten we alles zien.
    if (this.selectedFileExtensions.length === 0) {
      return true;
    }
    const file = await piece.get('file');
    const ext = await file.get('extension');
    return this.selectedFileExtensions.includes(ext);
  }

  async filterPieceType(piece) {
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

  _resetFilterState() {
    this.selectedPieces = [];
    this.selectedFileExtensions = [];
    this.selectedPieceTypes = [];
    this.pieceName = '';
    this.renderPieces = true;
  }
}
