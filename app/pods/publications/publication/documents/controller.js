import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { all } from 'ember-concurrency';
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
  @tracked isExpandedPieceView = false;
  @tracked isSavingPieces = false;
  @tracked isExpanded = false;
  @tracked showLoader = false;
  @tracked showTranslationModal = false;
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

  reset() {
    this._resetFilterState();
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

  @action
  openPieceUploadModal() {
    this.isOpenPieceUploadModal = true;
  }

  @action
  showPieceViewer(pieceId) {
    window.open(`/document/${pieceId}`);
  }

  @action
  toggleFolderCollapse(piece) {
    piece.set('collapsed', !piece.collapsed);
  }

  @action
  async onSave(newPieces) {
    await this.savePieces.perform(newPieces);
  }

  @task
  *savePieces(newPieces) {
    const savePromises = newPieces.map(async(piece) => {
      try {
        await this.savePiece.perform(piece);
      } catch (error) {
        await this.deleteUploadedPiece.perform(piece);
        throw error;
      }
    });
    yield all(savePromises);
    this.isOpenPieceUploadModal = false;
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

  @action
  onCancel() {
    this.isOpenPieceUploadModal = false;
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
