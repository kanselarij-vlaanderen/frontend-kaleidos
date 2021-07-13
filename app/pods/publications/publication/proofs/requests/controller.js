/* eslint-disable no-dupe-class-members */
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

// row object in order to be able to call properties
// of proofingActivity and publicationActivity similarly in the template
// e.g. {{row.resultActivity.email.subject}}
export class Row {
  requestActivity;
  // resolved relationships to prevent await in getters (await requestActivity.proofingActivity)
  proofingActivity;
  publicationActivity;

  constructor(params) {
    Object.assign(this, params);
  }

  get resultActivity() {
    if (this.proofingActivity) {
      return this.proofingActivity;
    } else if (this.publicationActivity) {
      return this.publicationActivity;
    }
    throw new Error('unknown activity');
  }

  get requestTypeTranslationKey() {
    if (this.proofingActivity) {
      return 'proofing-request';
    } else if (this.publicationActivity) {
      return 'publication-request';
    }
    throw new Error('unknown request');
  }

  get canOpenProofUploadModal() {
    return !!this.proofingActivity;
  }
}

export default class PublicationsPublicationProofsRequestsController extends Controller {
  @tracked publicationFlow;
  @tracked publicationSubcase;
  @tracked isUploadModalOpen;

  get isUploadDisabled() {
    return this.publicationSubcase.isFinished;
  }

  @action
  openProofUploadModal(row) {
    // Workaround for Dropdown::Item not having a (button with a) disabled state.
    if (this.isUploadDisabled) {
      return;
    }
    this.selectedRow = row;
    this.isUploadModalOpen = true;
  }

  @action
  closeProofUploadModal() {
    this.selectedRow = undefined;
    this.isUploadModalOpen = false;
  }

  @action
  async saveProofUpload(proofProperties) {
    try {
      await this.performSaveProofUpload(proofProperties);
    } finally {
      this.selectedRow = undefined;
      this.isUploadModalOpen = false;
    }
  }

  async performSaveProofUpload(proofUpload) {
    const now = new Date();

    const documentContainer = this.store.createRecord('document-container', {
      created: now,
    });
    await documentContainer.save();

    const proofingActivity = this.selectedRow.proofingActivity;
    const piece = this.store.createRecord('piece', {
      created: now,
      modified: now,
      receivedDate: proofUpload.receivedAtDate,
      confidential: false,
      name: proofUpload.name,
      file: proofUpload.file,
      documentContainer: documentContainer,
      proofingActivityGeneratedBy: proofingActivity,
    });
    const pieceSave = piece.save();

    proofingActivity.endDate = now;
    const proofingActivitySave = proofingActivity.save();

    await Promise.all([pieceSave, proofingActivitySave]);
  }
}
