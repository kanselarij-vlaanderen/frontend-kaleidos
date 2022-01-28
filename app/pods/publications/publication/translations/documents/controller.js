import Controller from '@ember/controller';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import {
  action,
  computed,
  set,
} from '@ember/object';
import { inject as service } from '@ember/service';
import { PUBLICATION_EMAIL } from 'frontend-kaleidos/config/config';
import CONSTANTS from 'frontend-kaleidos/config/constants';

const COLUMN_MAP = {
  naam: 'name',
  'ontvangen-op': 'receivedDate',
  'geupload-op': 'created',
};

export default class PublicationsPublicationTranslationsDocumentController extends Controller {
  @service currentSession;
  @service store;

  queryParams = [{
    sort: {
      as: 'volgorde',
    },
  }];

  // @tracked sort; // TODO: don't do tracking on qp's before updating to Ember 3.22+ (https://github.com/emberjs/ember.js/issues/18715)
  /** @type {string} kebab-cased key name, prepended with minus if descending */
  sort;

  @tracked publicationFlow;
  @tracked translationSubcase;
  @tracked publicationSubcase;
  @tracked showPieceEditModal = false;
  @tracked selectedPieceRows = [];
  @tracked pieceRowToEdit;
  @tracked isPieceUploadModalOpen = false;
  @tracked isTranslationRequestModalOpen = false;

  @computed('sort', 'model') // TODO: remove @computed once this.sort is marked as @tracked
  get pieceRows() {
    let property = 'created';
    let isDescending = false;
    if (this.sort) {
      isDescending = this.sort.startsWith('-');
      const sortKey = this.sort.substr(isDescending);
      property = COLUMN_MAP[sortKey] ?? property;
    }

    let pieceRows = this.model;
    pieceRows = pieceRows.sortBy(`piece.${property}`);
    if (isDescending) {
      pieceRows = pieceRows.reverseObjects();
    }

    return pieceRows;
  }

  get areAllPiecesSelected() {
    return this.model.length === this.selectedPieceRows.length;
  }

  get selectedPieces() {
    return this.selectedPieceRows.map((row) => row.piece);
  }

  get isRequestingDisabled() {
    return this.selectedPieceRows.length === 0 // no files are selected
      || this.translationSubcase.isFinished;
  }

  get isUploadDisabled() {
    return this.translationSubcase.isFinished;
  }

  get canDeletePieces() {
    return !this.translationSubcase.isFinished;
  }

  @action
  togglePieceSelection(selectedPieceRow) {
    const isPieceSelected = this.selectedPieceRows.includes(selectedPieceRow);
    if (isPieceSelected) {
      this.selectedPieceRows.removeObject(selectedPieceRow);
    } else {
      this.selectedPieceRows.pushObject(selectedPieceRow);
    }
  }

  @action
  toggleAllPiecesSelection() {
    if (this.areAllPiecesSelected) {
      this.selectedPieceRows = [];
    } else {
      this.selectedPieceRows = [...this.model];
    }
  }

  @action
  changeSorting(sort) {
    // TODO: remove setter once "sort" is tracked
    set(this, 'sort', sort);
  }

  @task
  *saveSourceDocument(translationDocument) {
    const piece = translationDocument.piece;
    piece.translationSubcaseSourceFor = this.translationSubcase;
    const documentContainer = yield piece.documentContainer;
    yield documentContainer.save();
    piece.pages = translationDocument.pagesAmount;
    piece.words = translationDocument.wordsAmount;
    piece.name = translationDocument.name;
    piece.language = yield this.store.findRecordByUri('language', CONSTANTS.LANGUAGES.NL);

    if (translationDocument.isSourceForProofPrint) {
      piece.publicationSubcaseSourceFor = this.publicationSubcase;
    }

    yield piece.save();
    this.isPieceUploadModalOpen = false;
    this.send('refresh');
  }


  @task
  *saveTranslationRequest(translationRequest) {
    const now = new Date();
    if (!this.translationSubcase.startDate) {
      this.translationSubcase.startDate = now;
    }
    this.translationSubcase.dueDate = translationRequest.translationDueDate;
    yield this.translationSubcase.save();

    const requestActivity = yield this.store.createRecord('request-activity', {
      startDate: now,
      translationSubcase: this.translationSubcase,
      usedPieces: translationRequest.attachments,
    });
    yield requestActivity.save();
    const french = yield this.store.findRecordByUri('language', CONSTANTS.LANGUAGES.FR);

    const pieces = translationRequest.attachments;
    const translationActivity = yield this.store.createRecord('translation-activity', {
      startDate: now,
      dueDate: translationRequest.translationDueDate,
      title: translationRequest.subject,
      subcase: this.translationSubcase,
      requestActivity: requestActivity,
      usedPieces: pieces,
      language: french,
    });
    yield translationActivity.save();

    const filePromises = translationRequest.attachments.mapBy('file');
    const filesPromise = Promise.all(filePromises);

    const outboxPromise = this.store.findRecordByUri('mail-folder', PUBLICATION_EMAIL.OUTBOX);
    const mailSettingsPromise = this.store.queryOne('email-notification-setting');
    const [files, outbox, mailSettings] = yield Promise.all([filesPromise, outboxPromise, mailSettingsPromise]);
    const mail = yield this.store.createRecord('email', {
      to: mailSettings.translationRequestToEmail,
      from: mailSettings.defaultFromEmail,
      folder: outbox,
      attachments: files,
      requestActivity: requestActivity,
      subject: translationRequest.subject,
      message: translationRequest.message,
    });
    yield mail.save();

    //Set status to 'to translation'
    this.publicationFlow.status =  yield this.store.findRecordByUri('publication-status', CONSTANTS.PUBLICATION_STATUSES.TO_TRANSLATIONS);
    yield this.publicationFlow.save();

    const oldChangeActivity = yield this.publicationFlow.publicationStatusChange;
    if (oldChangeActivity) {
      yield oldChangeActivity.destroyRecord();
    }
    const newChangeActivity = this.store.createRecord('publication-status-change', {
      startedAt: now,
      publication: this.publicationFlow,
    });
    yield newChangeActivity.save();

    this.selectedPieceRows = [];
    this.isTranslationRequestModalOpen = false;
    this.transitionToRoute('publications.publication.translations.requests');
  }

  @task
  *saveEditSourceDocument(translationDocument) {
    const piece = this.pieceRowToEdit.piece;
    piece.pages = translationDocument.pagesAmount;
    piece.words = translationDocument.wordsAmount;
    piece.name = translationDocument.name;

    if (translationDocument.isSourceForProofPrint) {
      piece.publicationSubcaseSourceFor = this.publicationSubcase;
    } else {
      piece.publicationSubcaseSourceFor = null;
    }

    yield piece.save();
    this.closePieceEditModal();
    this.send('refresh');
  }

  @task
  *deletePiece(pieceRow) {
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

  @action
  openPieceUploadModal() {
    this.isPieceUploadModalOpen = true;
  }

  @action
  closePieceUploadModal() {
    this.isPieceUploadModalOpen = false;
  }

  @action
  openPieceEditModal(pieceRow) {
    this.pieceRowToEdit = pieceRow;
    this.showPieceEditModal = true;
  }

  @action
  closePieceEditModal() {
    this.pieceRowToEdit = null;
    this.showPieceEditModal = false;
  }

  @action
  openTranslationRequestModal() {
    this.isTranslationRequestModalOpen = true;
  }

  @action
  closeTranslationRequestModal() {
    this.isTranslationRequestModalOpen = false;
  }
}
