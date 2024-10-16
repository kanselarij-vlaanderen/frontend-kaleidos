import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task, restartableTask, timeout } from 'ember-concurrency';
import { LIVE_SEARCH_DEBOUNCE_TIME } from 'frontend-kaleidos/config/config';
import { isEnabledCabinetSubmissions } from 'frontend-kaleidos/utils/feature-flag';

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
  @tracked isOpenAddSubmissionModal = false;

  @tracked linkedMandatees;

  constructor() {
    super(...arguments);
    this.filterText = this.args.caseFilter || '';
    this.loadLinkedMandatees.perform();
  }

  loadLinkedMandatees = task(async () => {
    this.linkedMandatees = await this.store.queryAll('mandatee', {
      'filter[user-organizations][:id:]': this.currentSession.organization.id,
      'filter[:has-no:end]': true,
      include: 'mandate.role',
      sort: 'start',
    });
  });

  get mayCreateSubmissions() {
    return this.currentSession.may('create-submissions') && this.linkedMandatees?.length && isEnabledCabinetSubmissions();
  }

  get isInCasesRoute() {
    return this.router.currentRouteName === 'cases.index';
  }

  get isInSubmissionRoute() {
    return this.router.currentRouteName === 'submissions';
  }

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
