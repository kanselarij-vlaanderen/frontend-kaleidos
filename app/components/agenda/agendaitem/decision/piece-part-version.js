import Component from '@glimmer/component';
import { trackedFunction } from 'ember-resources/util/function';

export default class PiecePartVersionComponent extends Component {
  constructor() {
    super(...arguments);
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
