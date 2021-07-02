import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

class Row {
  requestActivity;
  // resolved relationships to prevent await in getter (await requestActivity.proofingActivity)
  proofingActivity;
  publicationActivity;

  constructor(params) {
    Object.assign(this, params);
  }

  get requestTypeTranslationKey() {
    if (this.proofingActivity) {
      return 'proofing-request';
    } else if (this.publicationActivity) {
      return 'publication-request';
    }
    throw new Error('unknown request');
  }

  get attachments() {
    return this.requestActivity.usedPieces.sortBy('created');
  }

  get resultActivity() {
    if (this.proofingActivity) {
      return this.proofingActivity;
    } else if (this.publicationActivity) {
      return this.publicationActivity;
    }
    throw new Error('unknown activity');
  }

  get receivedPieces() {
    return this.resultActivity.generatedPieces.sortBy('created');
  }
}

export default class PublicationsPublicationProofsRequestsController extends Controller {
  @tracked rows;

  async initRows(model) {
    this.rows = await Promise.all(model.map(this.#createRow));
  }

  async #createRow(requestActivity) {
    const [proofingActivity, publicationActivity] = await Promise.all([
      requestActivity.proofingActivity,
      requestActivity.publicationActivity
    ]);

    return new Row({
      requestActivity: requestActivity,
      proofingActivity: proofingActivity,
      publicationActivity: publicationActivity,
    });
  }
}
