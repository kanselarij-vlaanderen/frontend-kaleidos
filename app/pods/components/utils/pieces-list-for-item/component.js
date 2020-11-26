import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class PiecesListForItem extends Component {
  @tracked isClickable = this.args.isClickable;

  @tracked isShowingAll = false;
  // TODO: Is het echt nodig om hier een @tracked te gebruiker? We visualiseren hier enkel?
  @tracked agendaitemOrSubcase = this.args.agendaitemOrSubcase;

  get moreThan20() {
    if (this.agendaitemOrSubcase) {
      if (this.agendaitemOrSubcase.documentContainers) {
        if (this.agendaitemOrSubcase.documentContainers.length > 20) {
          return true;
        }
      }
    }
    return false;
  }

  get documentContainersLimited() {
    if (this.agendaitemOrSubcase) {
      if (this.agendaitemOrSubcase.documentContainers) {
        if (this.agendaitemOrSubcase.documentContainers.length > 20) {
          const containers = this.agendaitemOrSubcase.documentContainers;
          return containers.content.splice(0, 20);
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
