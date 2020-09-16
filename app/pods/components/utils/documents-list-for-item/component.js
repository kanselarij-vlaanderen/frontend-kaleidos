import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class DocumentListForItem extends Component {
  @tracked isClickable = this.args.isClickable;

  @tracked isShowingAll = false;
  // TODO: Is het echt nodig om hier een @tracked te gebruiker? We visualiseren hier enkel?
  @tracked agendaitemOrSubcase = this.args.agendaitemOrSubcase;

  @tracked moreThan20 = null;

  get documents() {
    if (!this.agendaitemOrSubcase) {
      return null;
    }
    if (this.agendaitemOrSubcase.documents) {
      if (this.agendaitemOrSubcase.documents.length > 20) {
        this.moreThan20 = true;
      } else {
        this.moreThan20 = false;
      }
      if (this.isShowingAll) {
        return this.agendaitemOrSubcase.documents;
      }
      return this.agendaitemOrSubcase.documents;
    }
    return null;
  }

  @action
  toggleShowingAll() {
    this.isShowingAll = !this.isShowingAll;
  }
}
