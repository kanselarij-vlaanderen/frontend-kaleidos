import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { sortPieces } from 'frontend-kaleidos/utils/documents';

export default class PiecesListForItem extends Component {
  @tracked isClickable = this.args.isClickable;

  @tracked isShowingAll = false;

  get moreThan20() {
    if (this.args.pieces && this.args.pieces.length > 20) {
      return true;
    }
    return false;
  }

  get piecesLimited() {
    if (this.args.pieces && this.args.pieces.length > 20) {
      return this.sortedPieces.slice(0, 20);
    }
    return null;
  }

  get sortedPieces() {
    if (this.args.pieces && this.args.pieces.length > 0) {
      return sortPieces(this.args.pieces.toArray());
    }
    return null;
  }

  @action
  toggleShowingAll() {
    this.isShowingAll = !this.isShowingAll;
  }
}
