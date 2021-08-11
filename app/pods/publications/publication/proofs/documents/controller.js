import Controller from '@ember/controller';
import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { PUBLICATION_EMAIL } from 'frontend-kaleidos/config/config';

export class Model {
  pieceRows;
  decisions;

  // no async constructor() in JS
  static async create(pieces, decisions, currentSession) {
    const model = new Model();
    model.pieceRows = await Promise.all(pieces.map((piece) => PieceRow.create(piece, currentSession)));
    model.decisions = decisions;
    return model;
  }
}

// use:
// - isDeleteDisabled property
// - file property avoids error when piece (and file) are deleted
export class PieceRow {
  @service currentSession;

  @tracked piece;
  @tracked file;

  publicationSubcase;
  requestActivitiesUsedBy;

  // no async constructor() in JS
  static async create(piece, currentSession) {
    const row = new PieceRow();
    row.piece = piece;
    row.file = await piece.file;
    row.publicationSubcase = this.publicationSubcase;
    // avoid awaiting in getter
    row.requestActivitiesUsedBy = await piece.requestActivitiesUsedBy;
    row.currentSession = currentSession;
    return row;
  }

  get isShownDelete() {
    const hasPermission = this.currentSession.isOvrb;
    // can be translation or publication related
    const isUsedInRequest = this.requestActivitiesUsedBy.length > 0;
    // receivedDate is set if and only if it is a received pieced
    const isReceived = !!this.piece.receivedDate;
    const isUsed = isUsedInRequest || isReceived;
    return hasPermission && !isUsed;
  }

  get isDeleteDisabled() {
    return this.publicationSubcase.isFinished;
  }
}

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
  @tracked selectedPieceRows = [];
  @tracked isProofRequestModalOpen = false;
  @tracked proofRequestStage;
  @tracked isPieceUploadModalOpen = false;
  @tracked isPieceEditModalOpen = false;
  @tracked pieceRowToEdit;

  @computed('sort', 'model') // TODO: remove @computed once this.sort is marked as @tracked
  get pieceRows() {
    let property = 'created';
    let isDescending = false;
    if (this.sort) {
      isDescending = this.sort.startsWith('-');
      const sortKey = this.sort.substr(isDescending);
      property = COLUMN_MAP[sortKey] ?? property;
    }

    let pieceRows = this.model.pieceRows;
    pieceRows = pieceRows.sortBy(`piece.${property}`);
    if (isDescending) {
      pieceRows = pieceRows.reverseObjects();
    }

    return pieceRows;
  }

  get areAllPiecesSelected() {
    return this.model.pieceRows.length === this.selectedPieceRows.length;
  }

  get selectedPieces() {
    return this.selectedPieceRows.map((row) => row.piece);
  }

  get isRequestingDisabled() {
    return this.selectedPieceRows.length === 0
      || this.publicationSubcase.isFinished;
  }

  get canUploadPiece() {
    return this.currentSession.isOvrb;
  }

  get isUploadDisabled() {
    return this.publicationSubcase.isFinished;
  }

  @action
  togglePieceSelection(pieceRow) {
    const isPieceSelected = this.selectedPieceRows.includes(pieceRow);
    if (isPieceSelected) {
      this.selectedPieceRows.removeObject(pieceRow);
    } else {
      this.selectedPieceRows.pushObject(pieceRow);
    }
  }

  @action
  toggleAllPiecesSelection() {
    if (this.areAllPiecesSelected) {
      this.selectedPieceRows = [];
    } else {
      this.selectedPieceRows = [...this.model.pieceRows];
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
    this.selectedPieceRows = [];
    this.isProofRequestModalOpen = false;
    this.transitionToRoute('publications.publication.proofs.requests');
  }

  @action
  openPieceUploadModal() {
    this.isPieceUploadModalOpen = true;
  }

  @action
  closePieceUploadModal() {
    this.isPieceUploadModalOpen = false;
  }

  @action
  async saveCorrectionDocument(proofDocument) {
    await this.performSaveCorrectionDocument(proofDocument);
    this.isPieceUploadModalOpen = false;
    this.send('refresh');
  }

  @action
  openPieceEditModal(pieceRow) {
    this.pieceRowToEdit = pieceRow;
    this.isPieceEditModalOpen = true;
  }

  @action
  closePieceEditModal() {
    this.pieceRowToEdit = null;
    this.isPieceEditModalOpen = false;
  }

  @action
  async saveEditPiece(modalResult) {
    const piece = this.pieceRowToEdit.piece;
    piece.name = modalResult.name;
    piece.receivedDate = modalResult.receivedAtDate;
    await piece.save();

    this.closePieceEditModal();
    this.send('refresh');
  }

  @task
  *deletePiece(pieceRow) {
    // Workaround for Dropdown::Item not having a (button with a) disabled state.
    if (pieceRow.isDeleteDisabled) {
      return;
    }

    const piece = pieceRow.piece;
    const filePromise = piece.file;
    const documentContainerPromise = piece.documentContainer;
    const [file, documentContainer] = yield Promise.all([filePromise, documentContainerPromise]);

    const destroyPiece = piece.destroyRecord();
    const destroyFile = file.destroyRecord();
    const destroyDocumentContainer = documentContainer.destroyRecord();

    yield Promise.all([destroyPiece, destroyFile, destroyDocumentContainer]);

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

  async performSaveCorrectionDocument(proofDocument) {
    const now = new Date();

    const documentContainer = this.store.createRecord('document-container', {
      created: now,
    });
    await documentContainer.save();

    const piece = this.store.createRecord('piece', {
      created: now,
      modified: now,
      file: proofDocument.file,
      confidential: false,
      name: proofDocument.name,
      documentContainer: documentContainer,
      publicationSubcaseCorrectionFor: this.publicationSubcase,
    });
    await piece.save();

    return piece;
  }
}
