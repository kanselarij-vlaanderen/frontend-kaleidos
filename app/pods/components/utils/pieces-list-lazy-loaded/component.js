import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class PiecesListLazyLoaded extends Component {
  @tracked isShowingAll = false;

  get moreThan20() {
    if (this.args.pieceNames) {
      if (this.args.pieceNames.length > 20) {
        return true;
      }
    }
    return false;
  }

  get pieceNamesLimited() {
    if (this.args.pieceNames) {
      if (this.args.pieceNames.length > 20) {
        const pieceNames = this.args.pieceNames;
        return pieceNames.slice(0, 20);
      }
    }
    return null;
  }

  @action
  toggleShowingAll() {
    this.isShowingAll = !this.isShowingAll;
  }
}
