/* eslint-disable no-dupe-class-members */
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import CONFIG from 'frontend-kaleidos/utils/config';

const PIECE_RELATED_ENTITIES = {
  SOURCE_DOCUMENTS: 1,
  PROOFING_ACTIVITIES_GENERATED_PIECES: 2,
  PUBLICATION_ACTIVITIES_GENERATED_PIECES: 3,
};

const COLUMN_MAP = {
  'ontvangen-op': 'piece.receivedDate',
  'geupload-op': 'piece.created',
};

class Row {
  @tracked isSelected = false;
  @tracked piece;
  @tracked type;

  constructor(piece, type) {
    this.piece = piece;
    this.type = type;
  }

  get isCorrected() {
    // TODO
    return false;
  }
}

export default class PublicationsPublicationProofsDocumentsController extends Controller {
  queryParams = [{
    qpSortingString: {
      as: 'volgorde',
    },
  }];
  // TODO: don't do tracking on qp's before updating to Ember 3.22+ (https://github.com/emberjs/ember.js/issues/18715)
  /** @type {string} key name, prepended with minus if descending */
  qpSortingString = '';

  @tracked rows;
  @tracked publicationFlow;
  @tracked publicationSubcase;

  @tracked isRequestModalOpen = false;
  @tracked requestStage;
  /** @type {string} key name. prepended with minus if descending */
  @tracked sortingString = undefined;

  initRows(publicationSubcase) {
    this.#createRows(publicationSubcase);
    this.#initSort();
  }

  #createRows(publicationSubcase) {
    const sourceDocRows = publicationSubcase.sourceDocuments.map((piece) => new Row(piece, PIECE_RELATED_ENTITIES.SOURCE_DOCUMENTS));
    const proofDocRows = publicationSubcase.proofingActivities.map((it) => it.generatedPieces.map((piece) => new Row(piece, PIECE_RELATED_ENTITIES.PROOFING_ACTIVITIES_GENERATED_PIECES)));
    const pubDocRows = publicationSubcase.publicationActivities.map((it) => it.generatedPieces.map((piece) => new Row(piece, PIECE_RELATED_ENTITIES.PUBLICATION_ACTIVITIES_GENERATED_PIECES)));
    this.rows = [sourceDocRows, proofDocRows, pubDocRows].flat(Number.MAX_VALUE);
  }

  #initSort() {
    this.sortingString = this.qpSortingString;
    this.#sort(this.sortingString);
  }

  get areAllSelected() {
    return this.rows.every((row) => row.isSelected);
  }

  get selection() {
    return this.rows.filter((row) => row.isSelected).map((row) => row.piece);
  }

  @action
  toggleSelectionAll() {
    const newValue = !this.areAllSelected;
    for (const row of this.rows) {
      row.isSelected = newValue;
    }
  }

  @action
  toggleSelection(row) {
    row.isSelected = !row.isSelected;
  }

  @action
  changeSorting(sortingString) {
    this.sortingString = sortingString;
    this.set('qpSortingString', sortingString);
    this.#sort(sortingString);
    this.rows.arrayContentDidChange();
  }

  #sort(sortingString) {
    let property = 'piece.created';
    let isDescending = false;
    if (sortingString) {
      isDescending = sortingString.startsWith('-');
      const sortKey = sortingString.substr(isDescending);
      property = COLUMN_MAP[sortKey]?.property || property;
    }

    this.rows.sortBy(property);
    if (isDescending) {
      this.rows.reverse();
    }
  }

  get canOpenRequestModal() {
    return this.rows.any((row) => row.isSelected);
  }

  @action
  openRequestModal(stage) {
    if (stage === 'new') {
      this.requestStage = stage;
      this.isRequestModalOpen = true;
    }
  }

  @action
  onCancelRequest() {
    this.isRequestModalOpen = false;
  }

  @action
  async onSaveRequest(requestProperties) {
    await this.saveRequest(requestProperties);
    this.rows.forEach((row) => row.isSelected = false);
    this.isRequestModalOpen = false;
  }

  async saveRequest(requestProperties) {
    if (requestProperties.stage === 'new') {
      const now = new Date();
      const {
        publicationSubcase,
        attachments,
      } = requestProperties;

      const requestActivity = this.store.createRecord('request-activity', {
        startDate: now,
        title: requestProperties.subject,
        publicationSubcase: publicationSubcase,
        usedPieces: attachments,
      });
      await requestActivity.save();

      const proofingActivity = this.store.createRecord('proofing-activity', {
        startDate: now,
        title: requestProperties.subject,
        subcase: publicationSubcase,
        requestActivity: requestActivity,
        usedPieces: attachments,
      });
      const proofingActivitySave = proofingActivity.save();
      const saves = [proofingActivitySave];

      if (!requestProperties.publicationSubcase.startDate) {
        requestProperties.publicationSubcase.startDate = now;
        const publicationSubcaseSave = publicationSubcase.save();
        saves.push(publicationSubcaseSave);
      }

      const filePromises = attachments.mapBy('file');
      const attachmentFilesPromise = Promise.all(filePromises);
      const mailFolderPromise = this.store.findRecordByUri('mail-folder', CONSTANTS.MAIL_FOLDERS.OUTBOX);
      const [attachmentFiles, mailFolder] = await Promise.all([attachmentFilesPromise, mailFolderPromise]);
      const email = this.store.createRecord('email', {
        from: CONFIG.EMAIL.DEFAULT_FROM,
        to: CONFIG.EMAIL.TO.publishpreviewEmail,
        folder: mailFolder,
        subject: requestProperties.subject,
        message: requestProperties.message,
        attachments: attachmentFiles,
        requestActivity: requestActivity,
      });
      const emailSave = email.save();
      saves.push(emailSave);

      await Promise.all(saves);
    }
  }

  @action
  openPieceUploadModal() {
    // TODO
  }
}
