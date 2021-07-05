/* eslint-disable no-dupe-class-members */
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { PUBLICATION_EMAIL } from 'frontend-kaleidos/config/config';

const COLUMN_MAP = {
  'ontvangen-op': 'receivedDate',
  'geupload-op': 'created',
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
      property = COLUMN_MAP[sortKey]?.property || property;
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
    if (stage === 'new') {
      this.requestStage = stage;
      this.isRequestModalOpen = true;
    }
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
      const outboxPromise = this.store.findRecordByUri('mail-folder', PUBLICATION_EMAIL.OUTBOX);
      const mailSettingsPromise = this.store.queryOne('email-notification-setting');
      const [attachmentFiles, outbox, mailSettings] = await Promise.all([attachmentFilesPromise, outboxPromise, mailSettingsPromise]);
      const email = this.store.createRecord('email', {
        to: mailSettings.proofRequestToEmail,
        from: mailSettings.defaultFromEmail,
        folder: outbox,
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
}
