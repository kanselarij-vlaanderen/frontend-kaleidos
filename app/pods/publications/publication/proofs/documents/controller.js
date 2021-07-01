/* eslint-disable no-dupe-class-members */
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import UTILS_CONFIG from 'frontend-kaleidos/utils/config';
import CONFIG from 'frontend-kaleidos/config/config';


const PIECE_RELATED_ENTITIES = {
  SOURCE_DOCUMENTS: 1,
  PROOFING_ACTIVITIES_GENERATED_PIECES: 2,
  PUBLICATION_ACTIVITIES_GENERATED_PIECES: 3,
};

const COLUMN_MAP = {
  'ontvangen-op': (row) => row.piece.receivedDate,
  'geupload-op': (row) => row.piece.created,
};

const REQUEST_STAGES = {
  NEW: 'initial',
  EXTRA: 'extra',
  FINAL: 'final',
};

// row is necessary because ember-data fetches relationships to publicationSubcase/proofingActivity/publicationActivity
// (because piece is not the queried model, but an included one)
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
  qpSortingString;

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
    this.rows = [sourceDocRows, proofDocRows, pubDocRows].flat(Number.POSITIVE_INFINITY);
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
    // default sort
    let property = (row) => row.piece.created;
    let isDescending = true;

    if (sortingString) {
      isDescending = sortingString.startsWith('-');
      const sortKey = sortingString.substr(isDescending);
      property = COLUMN_MAP[sortKey] || property;
    }

    // sortBy does not work with nested keys
    this.rows.sort((row1, row2) => property(row1) - property(row2));
    if (isDescending) {
      this.rows.reverse();
    }
  }

  get canOpenRequestModal() {
    return this.rows.any((row) => row.isSelected);
  }

  @action
  openRequestModal(stage) {
    this.requestStage = stage;
    this.isRequestModalOpen = true;
  }

  @action
  onCancelRequest() {
    this.isRequestModalOpen = false;
  }

  @action
  async onSaveRequest(requestProperties) {
    try {
      await this.saveRequest(requestProperties);
    } catch (err) {
      this.isRequestModalOpen = false;
      throw err;
    }
    this.transitionToRoute('publications.publication.proofs.requests');
  }

  async saveRequest(requestProperties) {
    const now = new Date();
    const {
      stage,
      publicationSubcase,
      attachments,
    } = requestProperties;

    // REQUEST ACTIVITY
    const requestActivity = this.store.createRecord('request-activity', {
      startDate: now,
      title: requestProperties.subject,
      publicationSubcase: publicationSubcase,
      usedPieces: attachments,
    });
    await requestActivity.save();

    // RESULT ACTIVITY
    const activityProperties = {
      startDate: now,
      title: requestProperties.subject,
      subcase: publicationSubcase,
      requestActivity: requestActivity,
      usedPieces: attachments,
    };
    let activity;
    if (stage === REQUEST_STAGES.NEW) {
      activity = this.store.createRecord('proofing-activity', activityProperties);
    } else if (stage === REQUEST_STAGES.FINAL) {
      activity = this.store.createRecord('publication-activity', activityProperties);
    } else {
      throw new Error(`unknown request stage: ${stage}`);
    }
    const activitySave = activity.save();
    const saves = [activitySave];

    // PUBLICATION SUBCASE
    if (!requestProperties.publicationSubcase.startDate) {
      requestProperties.publicationSubcase.startDate = now;
      const publicationSubcaseSave = publicationSubcase.save();
      saves.push(publicationSubcaseSave);
    }

    // EMAIL
    const filePromises = attachments.mapBy('file');
    const attachmentFilesPromise = Promise.all(filePromises);
    const mailFolderPromise = this.store.findRecordByUri('mail-folder', CONFIG.PUBLICATION_EMAIL.OUTBOX);
    const [attachmentFiles, mailFolder] = await Promise.all([attachmentFilesPromise, mailFolderPromise]);

    let recipientEmail;
    if (stage === REQUEST_STAGES.NEW) {
      recipientEmail = UTILS_CONFIG.EMAIL.TO.publishpreviewEmail;
    } else if (stage === REQUEST_STAGES.FINAL) {
      recipientEmail = UTILS_CONFIG.EMAIL.TO.publishEmail;
    } else {
      throw new Error(`unknown request stage: ${stage}`);
    }
    const email = this.store.createRecord('email', {
      from: UTILS_CONFIG.EMAIL.DEFAULT_FROM,
      to: recipientEmail,
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
