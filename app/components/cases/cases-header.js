import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { enableNewCaseCreation } from 'frontend-kaleidos/utils/feature-flag';
import { inject as service } from '@ember/service';

/**
 * @argument didCreateNewCase: action passing down a newly created decisionmaking-flow.
 */
export default class CasesHeader extends Component {
  @service router;

  @tracked isOpenNewCaseModal = false;
  @tracked shouldRedirectToSubcase = false;

  get enableNewCaseCreation() {
    return enableNewCaseCreation();
  }

  @action
  toggleIsOpenNewCaseModal() {
    this.isOpenNewCaseModal = !this.isOpenNewCaseModal;
  } 

  @action
  toggleNewIsOpenNewCaseModal() {
    this.isOpenNewCaseModal = !this.isOpenNewCaseModal;
    this.shouldRedirectToSubcase = true;
  }

  @action
  saveNewCase(decisionmakingFlow) {
    this.toggleIsOpenNewCaseModal();
    if(this.shouldRedirectToSubcase) {
      this.router.transitionTo('cases.case.subcases.add-subcase', decisionmakingFlow.id);
    } else {
      this.args.didCreateNewCase(decisionmakingFlow);
    }
  }
}
