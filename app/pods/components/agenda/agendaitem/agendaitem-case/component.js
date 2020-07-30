import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class AgendaItemCase extends Component {
  @service('current-session') authentication;
  @tracked isEditing = false;

  get subcase() {
    if (this.args.agendaitem) {
      return this.args.agendaitem.agendaActivity.then((agendaActivitySubcase) => agendaActivitySubcase);
    }
    return null;
  }

  get subcases() {
    return this.subcase.then((subcase) => subcase.subcasesFromCase);
  }

  @action
  cancelEditing() {
    this.isEditing = false;
  }

  @action
  toggleIsEditing() {
    this.isEditing = !this.isEditing;
  }

  get shouldShowDetails() {
    if (this.args.agendaitem.showAsRemark || this.args.agendaitem.agendaActivity) {
      return true;
    }
    return false;
  }
}
