import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class CasesHeader extends Component {
  @service currentSession;
  @tracked showNewCaseModal = false;

  @action
  openNewCaseModal() {
    this.showNewCaseModal = true;
  }

  @action
  closeNewCaseModal() {
    this.showNewCaseModal = false;
  }

  @action
  saveNewCase(_case) {
    this.closeNewCaseModal();
    this.args.onSave(_case);
  }
}
