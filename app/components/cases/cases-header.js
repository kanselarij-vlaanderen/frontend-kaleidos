import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class CasesHeader extends Component {
  @service currentSession;
  @tracked isAddingCase = false;

  @action
  toggleAddingCase() {
    this.isAddingCase = !this.isAddingCase;
  }

  @action
  closeAction(caze) {
    this.isAddingCase = !this.isAddingCase;
    this.args.close(caze);
  }
}
