import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { isEnabledNewCaseCreation } from 'frontend-kaleidos/utils/feature-flag';
import { inject as service } from '@ember/service';

/**
 * @argument didCreateNewCase: action passing down a newly created decisionmaking-flow.
 */
export default class CasesHeader extends Component {
  @service router;

  @tracked isOpenNewCaseModal = false;
  @tracked IsOpenExperimentalNewCaseModal = false;

  get isEnabledNewCaseCreation() {
    return isEnabledNewCaseCreation();
  }

  @action
  toggleIsOpenNewCaseModal() {
    this.isOpenNewCaseModal = !this.isOpenNewCaseModal;
  } 

  @action
  toggleIsOpenExperimentalNewCaseModal() {
    this.IsOpenExperimentalNewCaseModal = !this.IsOpenExperimentalNewCaseModal;
  }

  @action
  saveNewCase() {
    this.toggleIsOpenNewCaseModal();
    this.args.didCreateNewCase(...arguments);
  }

  @action
  saveExperimentalNewCase(decisionmakingFlow) {
    this.IsOpenExperimentalNewCaseModal = false;
    this.router.transitionTo('cases.case.subcases.add-subcase', decisionmakingFlow.id);
  }
}
