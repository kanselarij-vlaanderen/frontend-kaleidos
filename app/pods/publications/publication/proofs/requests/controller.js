import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import moment from 'moment';
import ProofingActivity from 'frontend-kaleidos/models/proofing-activity';
import PublicationActivity from 'frontend-kaleidos/models/publication-activity';

class Row {
  intl;

  requestActivity;
  // resolved relationships to prevent await in getter (await requestActivity.proofingActivity)
  proofingActivity;
  publicationActivity;

  @tracked pieces;

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

  get panelTitle() {
    let requestTypeTranslationKey;
    // testing with `instanceof` resolves true for every Model
    switch (this.targetActivityType) {
      case ProofingActivity.modelName:
        requestTypeTranslationKey = 'proofing-request';
        break;
      case PublicationActivity.modelName:
        requestTypeTranslationKey = 'publication-request';
        break;
      default: throw new Error('unknown request');
    }
    const requestName = this.intl.t(requestTypeTranslationKey);

    const dateString = moment(this.requestActivity.startDate).format('D MMMM');
    const timeString = moment(this.requestActivity.startDate).format('H:mm');

    const modalTitle = this.intl.t('x-request-x-timestamp', {
      request: requestName,
      date: dateString,
      time: timeString,
    });
    return modalTitle;
  }
}

export default class PublicationsPublicationProofsRequestsController extends Controller {
  @service intl;

  @tracked rows;

  async initRows(model) {
    this.rows = await Promise.all(model.map(async(requestActivity) => {
      console.log('req', requestActivity);
      const [proofingActivity, publicationActivity] = await Promise.all([
        requestActivity.proofingActivity,
        requestActivity.publicationActivity
      ]);

      let pieces = [
        ...requestActivity.usedPieces.toArray(),
        ...(proofingActivity?.generatedPieces.toArray() ?? []),
        ...(publicationActivity?.generatedPieces.toArray() ?? [])
      ];
      pieces = pieces.flat(Number.POSITIVE_INFINITY);
      pieces.sortBy('created');

      const row = new Row({
        intl: this.intl,
        requestActivity: requestActivity,
        proofingActivity: proofingActivity,
        publicationActivity: publicationActivity,
        pieces: pieces,
      });
      return row;
    }));
  }
}
