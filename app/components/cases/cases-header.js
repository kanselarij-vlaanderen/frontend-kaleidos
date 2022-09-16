import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

/**
 * @argument didCreateNewCase: action passing down a newly created decisionmaking-flow.
 */
export default class CasesHeader extends Component {
  @service currentSession;
  @tracked isOpenNewCaseModal = false;

  @action
  toggleIsOpenNewCaseModal() {
    this.isOpenNewCaseModal = !this.isOpenNewCaseModal;
  }

  @action
  saveNewCase() {
    this.toggleIsOpenNewCaseModal();
    this.args.didCreateNewCase(...arguments);
  }
}
