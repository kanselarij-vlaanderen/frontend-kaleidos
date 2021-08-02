import Controller from '@ember/controller';
import {
  action,
  computed
} from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { PUBLICATION_EMAIL } from 'frontend-kaleidos/config/config';

const COLUMN_MAP = {
  naam: 'name',
  'ontvangen-op': 'receivedDate',
  'geupload-op': 'created',
};

const REQUEST_STAGES = {
  INITIAL: 'initial',
  EXTRA: 'extra',
  FINAL: 'final',
};

export default class PublicationsPublicationProofsDocumentsController extends Controller {
  queryParams = [{
    sort: {
      as: 'volgorde',
    },
  }];

  @service currentSession;

  // @tracked sort; // TODO: don't do tracking on qp's before updating to Ember 3.22+ (https://github.com/emberjs/ember.js/issues/18715)
  /** @type {string} kebab-cased key name, prepended with minus if descending */
  sort;

  @tracked publicationFlow;
  @tracked publicationSubcase;
  @tracked selectedPieces = [];
  @tracked isProofRequestModalOpen = false;
  @tracked proofRequestStage;
  @tracked isPieceUploadModalOpen = false;
  @tracked isPieceUploadSource;
  @tracked isPieceUploadCorrected;
  @tracked isPieceEditModalOpen = false;
  @tracked pieceToEdit;

  @computed('sort', 'model') // TODO: remove @computed once this.sort is marked as @tracked
  get pieces() {
    let property = 'created';
    let isDescending = false;
    if (this.sort) {
      isDescending = this.sort.startsWith('-');
      const sortKey = this.sort.substr(isDescending);
      property = COLUMN_MAP[sortKey] ?? property;
    }

    let pieces = this.model.pieces;
    pieces = pieces.sortBy(property);
    if (isDescending) {
      pieces = pieces.reverseObjects();
    }

    return pieces;
  }

  get areAllPiecesSelected() {
    return this.model.pieces.length === this.selectedPieces.length;
  }

  get isRequestingDisabled() {
    return this.selectedPieces.length === 0
      || this.publicationSubcase.isFinished;
  }

  get canUploadPiece() {
    return this.currentSession.isOvrb;
  }

  get isUploadDisabled() {
    return this.publicationSubcase.isFinished;
  }

  @action
  togglePieceSelection(selectedPiece) {
    const isPieceSelected = this.selectedPieces.includes(selectedPiece);
    if (isPieceSelected) {
      this.selectedPieces.removeObject(selectedPiece);
    } else {
      this.selectedPieces.pushObject(selectedPiece);
    }
  }

  @action
  toggleAllPiecesSelection() {
    if (this.areAllPiecesSelected) {
      this.selectedPieces = [];
    } else {
      this.selectedPieces = [...this.model.pieces];
    }
  }

  @action
  changeSorting(sort) {
    this.set('sort', sort);
  }

  @action
  openProofRequestModal(stage) {
    this.proofRequestStage = stage;
    this.isProofRequestModalOpen = true;
  }

  @action
  closeProofRequestModal() {
    this.isProofRequestModalOpen = false;
  }

  @action
  async saveProofRequest(requestProperties) {
    await this.performSaveProofRequest(requestProperties);
    this.selectedPieces = [];
    this.isProofRequestModalOpen = false;
    this.transitionToRoute('publications.publication.proofs.requests');
  }

  @action
  openSourceUploadModal() {
    this.isPieceUploadModalOpen = true;
    this.isPieceUploadSource = true;
  }

  @action
  openCorrectionUploadModal() {
    this.isPieceUploadModalOpen = true;
    this.isPieceUploadCorrected = true;
  }

  @action
  closePieceUploadModal() {
    this.isPieceUploadModalOpen = false;

    this.isPieceUploadSource = false;
    this.isPieceUploadCorrected = false;
  }

  @action
  async savePieceUpload(proofDocument) {
    await this.performSavePieceUpload(proofDocument, this.isPieceUploadSource, this.isPieceUploadCorrected);

    this.closePieceUploadModal();
    this.send('refresh');
  }

  @action
  openPieceEditModal(piece) {
    this.pieceToEdit = piece;
    this.isPieceEditModalOpen = true;
  }

  @action
  closePieceEditModal() {
    this.pieceToEdit = null;
    this.isPieceEditModalOpen = false;
  }

  @action
  async savePieceEdit(modalResult) {
    const piece = this.pieceToEdit;
    piece.name = modalResult.name;
    piece.receivedDate = modalResult.receivedAtDate;
    await piece.save();

    this.closePieceEditModal();
    this.send('refresh');
  }

  async performSaveProofRequest(proofRequest) {
    const now = new Date();

    const saves = [];

    // PUBLICATION SUBCASE
    if (!this.publicationSubcase.startDate) {
      this.publicationSubcase.startDate = now;
      const publicationSubcaseSave = this.publicationSubcase.save();
      saves.push(publicationSubcaseSave);
    }

    // REQUEST ACTIVITY
    const requestActivity = this.store.createRecord('request-activity', {
      startDate: now,
      title: proofRequest.subject,
      publicationSubcase: this.publicationSubcase,
      usedPieces: proofRequest.attachments,
    });
    await requestActivity.save();

    // RESULT ACTIVITY
    const activityProperties = {
      startDate: now,
      title: proofRequest.subject,
      subcase: this.publicationSubcase,
      requestActivity: requestActivity,
      usedPieces: proofRequest.attachments,
    };
    let activity;
    if (proofRequest.stage === REQUEST_STAGES.INITIAL
      || proofRequest.stage === REQUEST_STAGES.EXTRA) {
      activity = this.store.createRecord('proofing-activity', activityProperties);
    } else if (proofRequest.stage === REQUEST_STAGES.FINAL) {
      activity = this.store.createRecord('publication-activity', activityProperties);
    } else {
      throw new Error(`unknown request stage: ${proofRequest.stage}`);
    }
    const activitySave = activity.save();
    saves.push(activitySave);

    // EMAIL
    const filePromises = proofRequest.attachments.mapBy('file');
    const filesPromise = Promise.all(filePromises);
    const outboxPromise = this.store.findRecordByUri('mail-folder', PUBLICATION_EMAIL.OUTBOX);
    const mailSettingsPromise = this.store.queryOne('email-notification-setting');
    const [files, outbox, mailSettings] = await Promise.all([filesPromise, outboxPromise, mailSettingsPromise]);
    const mail = this.store.createRecord('email', {
      to: mailSettings.proofRequestToEmail,
      from: mailSettings.defaultFromEmail,
      folder: outbox,
      subject: proofRequest.subject,
      message: proofRequest.message,
      attachments: files,
      requestActivity: requestActivity,
    });
    const emailSave = mail.save();
    saves.push(emailSave);

    await Promise.all(saves);
  }

  async performSavePieceUpload(uploadProperties, isSource, isCorrection) {
    const now = new Date();

    const documentContainer = this.store.createRecord('document-container', {
      created: now,
    });
    await documentContainer.save();

    const pieceProperties = {
      created: now,
      modified: now,
      name: uploadProperties.name,
      confidential: false,
      file: uploadProperties.file,
      documentContainer: documentContainer,
    };
    if (isSource) {
      pieceProperties.publicationSubcaseSourceFor = this.publicationSubcase;
    } else if (isCorrection) {
      pieceProperties.publicationSubcaseCorrectionFor = this.publicationSubcase;
    } else {
      throw new Error('no relationship specified');
    }
    const piece = this.store.createRecord('piece', pieceProperties);
    await piece.save();

    return piece;
  }
}
