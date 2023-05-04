import Component from '@glimmer/component';
import { trackedFunction } from 'ember-resources/util/function';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { dateFormat } from 'frontend-kaleidos/utils/date-format';
import { action } from '@ember/object';

export default class PiecePartVersionComponent extends Component {
  @service intl;

  @tracked selectedVersion = this.args.piecePart;

  labelForVersion = (piecePart) => {
    if (piecePart === this.args.piecePart) {
      return this.intl.t('current-version');
    } else {
      return this.intl.t('version-of-date-at-time', {
        date: dateFormat(piecePart.created, 'dd-MM-yyyy'),
        time: dateFormat(piecePart.created, 'HH:mm'),
      });
    }
  };

  @action
  onVersionClicked(piecePart) {
    this.selectedVersion = piecePart;
    this.args.onVersionClicked?.(piecePart.value);
  }

  previousVersions = trackedFunction(this, async () => {
    if (!this.args.piecePart) {
      return [];
    }

    const previousVersions = [];
    let current = this.args.piecePart;
    while ((current = await current.previousPiecePart)) {
      previousVersions.push(current);
    }

    return previousVersions;
  });
}
