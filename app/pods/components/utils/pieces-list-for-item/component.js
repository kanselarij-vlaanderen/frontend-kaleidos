import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class PiecesListForItem extends Component {
  @tracked isClickable = this.args.isClickable;

  @tracked isShowingAll = false;

  get moreThan20() {
    if (this.args.agendaitemOrSubcase) {
      if (this.args.agendaitemOrSubcase.sortedPieces) {
        if (this.args.agendaitemOrSubcase.sortedPieces.length > 20) {
          return true;
        }
      }
    }
    return false;
  }

  get piecesLimited() {
    if (this.args.agendaitemOrSubcase) {
      if (this.args.agendaitemOrSubcase.sortedPieces) {
        if (this.args.agendaitemOrSubcase.sortedPieces.length > 20) {
          const sortedPieces = this.args.agendaitemOrSubcase.sortedPieces;
          return sortedPieces.slice(0, 20);
        }
      }
    }
    return null;
  }

  @action
  toggleShowingAll() {
    this.isShowingAll = !this.isShowingAll;
  }
}
