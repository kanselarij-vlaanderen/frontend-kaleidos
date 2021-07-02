/* eslint-disable no-dupe-class-members */
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import * as CONFIG from 'frontend-kaleidos/config/config';
import UTILS_CONFIG from 'frontend-kaleidos/utils/config';

const COLUMN_MAP = {
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
    qpSortingString: {
      as: 'volgorde',
    },
  }];
  // TODO: don't do tracking on qp's before updating to Ember 3.22+ (https://github.com/emberjs/ember.js/issues/18715)
  /** @type {string} key name, prepended with minus if descending */
  qpSortingString;

  @tracked publicationFlow;
  @tracked publicationSubcase;

  @tracked selection;
  /** @type {string} key name. prepended with minus if descending */
  @tracked sortingString = undefined;

  @tracked isRequestModalOpen = false;
  @tracked requestStage;

  initSort() {
    this.sortingString = this.qpSortingString;
    this.#sort(this.sortingString);
  }

  get areAllSelected() {
    return this.model.length === this.selection.length;
  }

  @action
  toggleSelectionAll() {
    if (this.areAllSelected) {
      this.selection.clear();
    } else {
      this.selection = this.model.toArray();
    }
  }

  @action
  toggleSelection(row) {
    if (!this.selection.includes(row)) {
      this.selection.pushObject(row);
    } else {
      this.selection.removeObject(row);
    }
  }

  @action
  changeSorting(sortingString) {
    this.sortingString = sortingString;
    this.set('qpSortingString', sortingString);
    this.#sort(sortingString);
    // sort is not tracked by ember
    this.model.arrayContentDidChange();
  }

  #sort(sortingString) {
    let property = 'created';
    let isDescending = true;
    if (sortingString) {
      isDescending = sortingString.startsWith('-');
      const sortKey = sortingString.substr(isDescending);
      property = COLUMN_MAP[sortKey] || property;
    }

    this.model.sortBy(property);
    if (isDescending) {
      this.model.reverse();
    }
  }

  get canOpenRequestModal() {
    return this.selection.length > 0;
  }

  @action
  openRequestModal(stage) {
    this.requestStage = stage;
    this.isRequestModalOpen = true;
  }

  @action
  cancelRequest() {
    this.isRequestModalOpen = false;
  }

  @action
  async saveRequest(requestProperties) {
    try {
      await this.#saveRequest(requestProperties);
    } finally {
      this.isRequestModalOpen = false;
    }
    this.selection = [];
    this.transitionToRoute('publications.publication.proofs.requests');
  }

  async #saveRequest(requestProperties) {
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
    if (stage === REQUEST_STAGES.INITIAL) {
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
    if (stage === REQUEST_STAGES.INITIAL) {
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
