import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import ProofingActivity from 'frontend-kaleidos/models/proofing-activity';
import PublicationActivity from 'frontend-kaleidos/models/publication-activity';

class Row {
  intl;

  requestActivity;
  // resolved relationships to prevent await in getters (await requestActivity.proofingActivity)
  proofingActivity;
  publicationActivity;

  constructor(params) {
    Object.assign(this, params);
  }

  get targetActivityType() {
    if (this.proofingActivity) {
      return ProofingActivity.modelName;
    } else if (this.publicationActivity) {
      return PublicationActivity.modelName;
    }
    throw new Error('unknown request');
  }

  get requestType() {
    // testing with `instanceof` returns true for every Model type
    switch (this.targetActivityType) {
      case ProofingActivity.modelName:
        return 'proofing-request';
      case PublicationActivity.modelName:
        return 'publication-request';
      default: throw new Error('unknown request');
    }
  }

  get pieces() {
    const pieces = [
      ...this.requestActivity.usedPieces.toArray(),
      ...(this.proofingActivity?.generatedPieces.toArray() ?? []),
      ...(this.publicationActivity?.generatedPieces.toArray() ?? [])
    ];
    pieces.sortBy('created');
    return pieces;
  }

  get canOpenUploadModal() {
    return this.targetActivityType === ProofingActivity.modelName;
  }
}

export default class PublicationsPublicationProofsRequestsController extends Controller {
  @service intl;

  selectedRow;

  @tracked rows;
  @tracked publicationFlow;
  @tracked isUploadModalOpen;

  async initRows(model) {
    this.rows = await Promise.all(model.map(async(requestActivity) => {
      const [proofingActivity, publicationActivity] = await Promise.all([
        requestActivity.proofingActivity,
        requestActivity.publicationActivity
      ]);

      const row = new Row({
        intl: this.intl,
        requestActivity: requestActivity,
        proofingActivity: proofingActivity,
        publicationActivity: publicationActivity,
      });
      return row;
    }));
  }

  @action
  openUploadModal(row) {
    this.selectedRow = row;
    this.isUploadModalOpen = true;
  }

  @action
  closeUploadModal() {
    this.selectedRow = undefined;
    this.isUploadModalOpen = false;
  }

  @action
  async saveProof(proofProperties) {
    try {
      await this.#saveProof(proofProperties);
    } finally {
      this.selectedRow = undefined;
      this.isUploadModalOpen = false;
    }
  }

  async #saveProof(proofProperties) {
    const now = new Date();

    const documentContainer = this.store.createRecord('document-container', {
      created: now,
    });
    await documentContainer.save();

    const piece = this.store.createRecord('piece', {
      created: now,
      modified: now,
      file: proofProperties.file,
      confidential: false,
      name: proofProperties.name,
      documentContainer: documentContainer,
    });
    await piece.save();

    const proofingActivity = this.selectedRow.proofingActivity;
    const generatedPieces = proofingActivity.generatedPieces;
    generatedPieces.pushObject(piece);
    proofingActivity.endDate = now;
    await proofingActivity.save();
  }
}
