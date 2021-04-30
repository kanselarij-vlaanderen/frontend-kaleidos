import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class CasesHeader extends Component {
  @service currentSession;

  classNames = ['auk-navbar', 'auk-navbar--bordered-bottom', 'auk-navbar--gray-100'];

  isAddingCase = false;

  @action
  toggleAddingCase() {
    this.toggleProperty('isAddingCase');
  }

  @action
  closeAction(caze) {
    this.toggleProperty('isAddingCase');
    this.close(caze);
  }
}
