import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import moment from 'moment';

class Row {
  intl;
  @tracked requestActivity;
  @tracked pieces;

  constructor(params) {
    Object.assign(this, params);
  }


  get targetActivityType() {
    if (this.requestActivity.proofingActivity) {
      return 'proofing-activity';
    } else if (this.requestActivity.publicationActivity) {
      return 'publication-activity';
    }
    throw new Error('unknown request');
  }

  get panelTitle() {
    let requestType;
    switch (this.targetActivityType) {
      case 'proofing-activity':
        requestType = 'proofing-request';
        break;
      case 'publication-activity':
        requestType = 'publication-request';
        break;
      default: throw new Error('unknown request');
    }
    const requestName = this.intl.t(requestType);

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
      const row = new Row({
        intl: this.intl,
        requestActivity: requestActivity,
        pieces: await this.#concatPieces(requestActivity),
      });
      return row;
    }));
  }

  async #concatPieces(requestActivity) {
    let pieces = [
      ...requestActivity.usedPieces.toArray(),
      ...((await requestActivity.proofingActivity)?.generatedPieces.toArray() ?? []),
      ...((await requestActivity.publicationActivity)?.generatedPieces.toArray() ?? [])
    ];
    pieces = pieces.flat(Number.POSITIVE_INFINITY);
    console.log('pieces', pieces);
    pieces.sortBy('created');
    return pieces;
  }
}
