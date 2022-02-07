import Component from '@glimmer/component';
import { isEmpty } from '@ember/utils';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import ENV from 'frontend-kaleidos/config/environment';

export default class PublicationsPublicationDecisionsDocumentsPanelComponent extends Component {
  @service store;
  @service router;
  @service currentSession;
  @service publicationService;
  @service signatureService;

  @tracked isViaCouncilOfMinisters;

  @tracked isOpenRefDocUploadModal = false;
  @tracked isNewContainer;
  @tracked selectedPiece;
  @tracked isOpenTranslationRequestModal = false;

  // property: TranslationRequestModal requires resolved TranslationSubcase
  @tracked translationSubcase;

  constructor() {
    super(...arguments);
    this.initFields();
  }

  async initFields() {
    this.isViaCouncilOfMinisters =
      await this.publicationService.getIsViaCouncilOfMinisters(
        this.args.publicationFlow
      );
    this.translationSubcase = await this.args.publicationFlow
      .translationSubcase;
  }

  @action
  openUploadRefDocModal() {
    this.selectedPiece = undefined;
    this.isNewContainer = true;
    this.isOpenRefDocUploadModal = true;
  }

  @task
  *saveRefDoc(refDocParams) {
    yield this.performSaveRefDoc(refDocParams);
    this.isOpenRefDocUploadModal = false;
    this.args.refresh();
  }

  async performSaveRefDoc(refDocParams) {
    const now = new Date();
    let documentContainer;
    // upload new document
    if (this.isNewContainer) {
      documentContainer = this.store.createRecord('document-container', {
        created: now,
      });
      await documentContainer.save();
    }
    // upload new version of a document
    else {
      documentContainer = await this.selectedPiece.documentContainer;
    }

    const piece = this.store.createRecord('piece', {
      created: now,
      modified: now,
      name: refDocParams.name,
      confidential: false,
      pages: refDocParams.pageCount,
      file: refDocParams.file,
      documentContainer: documentContainer,
      publicationFlow: this.args.publicationFlow,
    });
    await piece.save();
  }

  @action
  closeRefDocUploadModal() {
    this.isOpenRefDocUploadModal = false;
  }

  @action
  async saveRefDocVersion(piece) {
    const publicationFlow = this.args.publicationFlow;
    piece.publicationFlow = publicationFlow;
    await piece.save();
    this.args.refresh();
  }

  get isShownSignatureMarker() {
    const isEnabled = !isEmpty(ENV.APP.ENABLE_SIGNATURES);
    const hasPermission = this.currentSession.may('manage-signatures');
    const isSignable = this.isViaCouncilOfMinisters;
    return isEnabled && hasPermission && isSignable;
  }

  @action
  async markForSignature(piece) {
    // TODO: check whether this is a correct approach
    const agendaItemTreatment = await this.args.publicationFlow
      .agendaItemTreatment;
    await this.signatureService.markDocumentForSignature(
      piece,
      agendaItemTreatment
    );
  }

  @action
  async unmarkForSignature(piece) {
    await this.signatureService.unmarkDocumentForSignature(piece);
  }

  @action
  async openTranslationRequestModal(piece) {
    const publicationFlow = this.args.publicationFlow;
    this.translationSubcase = await publicationFlow.translationSubcase;
    this.selectedPiece = piece;
    this.isOpenTranslationRequestModal = true;
  }

  @action
  closeTranlationRequestModal() {
    this.isOpenTranslationRequestModal = false;
  }

  @task
  *saveTranslationRequest(translationRequestParams) {
    yield this.performSaveTranslationRequest(translationRequestParams);
    this.isOpenTranslationRequestModal = false;
    this.router.transitionTo('publications.publication.translations.requests');
  }

  @action
  async performSaveTranslationRequest(translationRequestParams) {
    const publicationFlow = this.args.publicationFlow;
    await this.publicationService.saveTranslationRequest(
      publicationFlow,
      translationRequestParams
    );
  }
}
