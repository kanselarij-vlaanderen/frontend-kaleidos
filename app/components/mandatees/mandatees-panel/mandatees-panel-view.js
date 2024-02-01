import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class MandateesMandateesPanelEditComponent extends Component {
  @service currentSession;

  get isAdminOrSecretarie() {
    return this.currentSession.isAdmin || this.currentSession.isSecretarie;
  }

}
