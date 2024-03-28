import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { restartableTask, timeout } from 'ember-concurrency';
import { LIVE_SEARCH_DEBOUNCE_TIME } from 'frontend-kaleidos/config/config';

/**
 * @argument didCreateNewCase: action passing down a newly created decisionmaking-flow.
 * @argument onSetFilter
 * @argument caseFilter: filter's initial value
 */
export default class CasesHeader extends Component {
  @service router;

  @tracked isOpenNewCaseAddSubcaseModal = false;
  @tracked filterText;

  constructor() {
    super(...arguments);
    this.filterText = this.args.caseFilter || '';
  }

  @action
  saveNewCaseAddSubcase(decisionmakingFlow) {
    this.isOpenNewCaseAddSubcaseModal = false;
    this.router.transitionTo('cases.case.subcases.add-subcase', decisionmakingFlow.id);
  }

  debouncedSetFilter = restartableTask(async (event) => {
    this.filterText = event.target.value;
    await timeout(LIVE_SEARCH_DEBOUNCE_TIME);
    this.args.onSetFilter(this.filterText);
  });

  clearFilter = () => {
    this.filterText = '';
    this.args.onSetFilter(this.filterText);
  }
}
