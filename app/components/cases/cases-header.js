import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { restartableTask, timeout } from 'ember-concurrency';
import { LIVE_SEARCH_DEBOUNCE_TIME } from 'frontend-kaleidos/config/config';

/**
 * @argument didCreateNewCase: action passing down a newly created decisionmaking-flow.
 */
export default class CasesHeader extends Component {
  @service router;

  @tracked isOpenNewCaseAddSubcaseModal = false;

  @action
  saveNewCaseAddSubcase(decisionmakingFlow) {
    this.isOpenNewCaseAddSubcaseModal = false;
    this.router.transitionTo('cases.case.subcases.add-subcase', decisionmakingFlow.id);
  }

  debouncedSetFilter = restartableTask(async (event) => {
    if (event.target.value === "") {
      this.clearFilter();
      return;
    }
    await timeout(LIVE_SEARCH_DEBOUNCE_TIME);
    this.args.setNameSearchText(event.target.value);
  });

  clearFilter = () => {
    this.args.setNameSearchText(null);
  }
}
