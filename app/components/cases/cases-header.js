import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task, restartableTask, timeout } from 'ember-concurrency';
import { LIVE_SEARCH_DEBOUNCE_TIME } from 'frontend-kaleidos/config/config';

/**
 * @argument didCreateNewCase: action passing down a newly created decisionmaking-flow.
 * @argument onSetFilter
 * @argument caseFilter: filter's initial value
 */
export default class CasesHeader extends Component {
  @service currentSession;
  @service router;
  @service store;

  @tracked isOpenNewCaseAddSubcaseModal = false;
  @tracked filterText;

  @tracked linkedMandatees;

  constructor() {
    super(...arguments);
    this.filterText = this.args.caseFilter || '';
    this.loadLinkedMandatees.perform();
  }

  loadLinkedMandatees = task(async () => {
    const linkedMandatees = await this.store.queryAll('mandatee', {
      'filter[user-organizations][:id:]': this.currentSession.organization.id,
      'filter[:has-no:end]': true,
      include: 'mandate.role',
      sort: 'start',
    });
    this.linkedMandatees = linkedMandatees.slice().sort((m1, m2) => m1.priority - m2.priority);
  });

  @action
  onInputFilter(event) {
    this.filterText = event.target.value;
    this.debouncedSetFilter.perform();
  }

  @action
  saveNewCaseAddSubcase(decisionmakingFlow) {
    this.isOpenNewCaseAddSubcaseModal = false;
    this.router.transitionTo('cases.case.subcases.add-subcase', decisionmakingFlow.id);
  }

  debouncedSetFilter = restartableTask(async () => {
    await timeout(LIVE_SEARCH_DEBOUNCE_TIME);
    this.args.onSetFilter(this.filterText);
  });

  clearFilter = () => {
    this.filterText = '';
    this.args.onSetFilter(this.filterText);
  }
}
