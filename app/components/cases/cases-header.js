import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

/**
 * @argument didCreateNewCase: action passing down a newly created decisionmaking-flow.
 */
export default class CasesHeader extends Component {
  @service router;

  @tracked isOpenNewCaseModal = false;
  @tracked isOpenNewCaseAddSubcaseModal = false;

  @action
  saveNewCaseAddSubcase(decisionmakingFlow) {
    this.isOpenNewCaseAddSubcaseModal = false;
    this.router.transitionTo('cases.case.subcases.add-subcase', decisionmakingFlow.id);
  }
}
