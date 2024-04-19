import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';

/*
 * @argument subcase
 * @argument onMoveSubcase: from args, the parent route subcases needs to be refreshed after subcase is moved/deleted
 */
export default class SubcasesSubcaseHeaderComponent extends Component {
  @service store;
  @service agendaService;
  @service router;
  @service toaster;
  @service intl;

  @tracked isAssigningToAgenda = false;
  @tracked isAssigningToOtherCase = false;
  @tracked promptDeleteCase = false;
  @tracked isDeletingSubcase = false;
  @tracked isShowingOptions = false;
  @tracked isLoading = false;
  @tracked isAssigning = false;
  @tracked caseToDelete = null;
  @tracked subcaseToDelete = null;
  @tracked canPropose = false;
  @tracked canDelete = false;

  constructor() {
    super(...arguments);

    this.loadData.perform();
  }

  @task
  *loadData() {
    const activities = yield this.args.subcase.hasMany('agendaActivities').reload();
    this.canPropose = !(activities?.length || this.isAssigningToAgenda || this.isLoading);
    this.canDelete = (this.canPropose && !this.isAssigningToAgenda);
  }

  triggerDeleteCaseDialog() {
    this.promptDeleteCase = true;
  }

  navigateToSubcaseOverview(decisionmakingFlow) {
    this.router.transitionTo('cases.case.index', decisionmakingFlow.id);
  }

  toggleAllPropertiesBackToDefault() {
    this.isAssigningToAgenda = false;
    this.isDeletingSubcase = false;
    this.selectedSubcase = null;
    this.subcaseToDelete = null;
    this.isLoading = false;
    this.isAssigningToOtherCase = false;
  }

  // TODO KAS-3256 We should take another look of the deleting case feature in light of publications also using cases.
  @task
  *deleteCase(_case) {
    const decisionmakingFlow = yield _case.decisionmakingFlow;
    yield _case.destroyRecord();
    yield decisionmakingFlow.destroyRecord();
    this.promptDeleteCase = false;
    this.caseToDelete = null;
    this.router.transitionTo('cases');
  }

  @action
  cancel() {
    this.toggleAllPropertiesBackToDefault();
  }

  @action
  showMultipleOptions() {
    this.isShowingOptions = !this.isShowingOptions;
  }

  @action
  requestDeleteSubcase(subcase) {
    this.isDeletingSubcase = true;
    this.subcaseToDelete = subcase;
  }

  /**
   * @param {boolean} _fullCopy This parameter is unused, we just have it here because the component expects it
   * @param {Meeting} meeting
   * @param {boolean} isFormallyOk
   * @param {string} privatecomment
   */
  @task
  *proposeForAgenda(_fullCopy, meeting, isFormallyOk, privateComment) {
    this.isAssigningToAgenda = false;
    this.isLoading = true;
    try {
      yield this.agendaService.putSubmissionOnAgenda(
        meeting,
        this.args.subcase,
        isFormallyOk,
        privateComment,
      );
    } catch (error) {
      this.router.refresh();
      this.toaster.error(
        this.intl.t('error-while-submitting-subcase-on-meeting', { error: error.message }),
        this.intl.t('warning-title')
      );
    }
    this.toggleAllPropertiesBackToDefault();
    yield this.loadData.perform();
    this.args.onProposedForAgenda();
  }

  @action
  async deleteSubcase() {
    this.isLoading = true;
    const subcaseToDelete = await this.subcaseToDelete;
    const decisionmakingFlow = await subcaseToDelete.decisionmakingFlow;

    subcaseToDelete.hasMany('agendaActivities').reload();
    const agendaActivities = await subcaseToDelete.agendaActivities;

    if (agendaActivities?.length > 0) {
      return;
    }

    const itemToDelete = await this.store.findRecord('subcase', subcaseToDelete.id, {
      reload: true,
    });
    const newsItem = await itemToDelete.newsItem;
    if (newsItem) {
      await newsItem.destroyRecord();
    }
    /*
    In v3.26.x, we used to call `await itemToDelete.destroyRecord();` here
    In theory, destroyRecord() is the same as deleteRecord() followed by save(). Problem is, in the tests that's not the case.
    The test `integration/all-flaky-tests/subcase.spec.js#should add a subcase and then delete it` would fail with the following exception thrown by Ember:
    > Assertion Failed: Attempted to access the computed <(unknown):ember461>.isTruthy on a destroyed object, which is not allowed
    After replacing the call to destroyRecord() with deleteRecord() & save(), the test would pass on v3.28.8
    */
    itemToDelete.deleteRecord();
    await itemToDelete.save();

    this.navigateToSubcaseOverview(decisionmakingFlow);
    this.args.onMoveSubcase();
  }

  @action
  cancelDeleteSubcase() {
    this.isDeletingSubcase = false;
  }

  @action
  triggerMoveSubcaseDialog() {
    this.isAssigningToOtherCase = true;
  }

  moveSubcase = task(async (_newDecisionmakingFlow) => {
    const newDecisionmakingFlow = await this.store.findRecord('decisionmaking-flow', _newDecisionmakingFlow.id);

    const oldDecisionmakingFlow = await this.args.subcase.decisionmakingFlow;
    this.args.subcase.decisionmakingFlow = newDecisionmakingFlow;
    await this.args.subcase.save();
    this.isAssigningToOtherCase = false;

    const subCases = await oldDecisionmakingFlow.hasMany('subcases').reload();
    if (subCases.length === 0) {
      const oldCase = await oldDecisionmakingFlow.case;
      const publicationFlow = await this.store.queryOne('publication-flow', {
        'filter[case][:id:]': oldCase.id,
      });
      // TODO KAS-3315 The deletion of case is only possible in this situation
      if (!publicationFlow) {
        this.caseToDelete = oldCase;
        this.triggerDeleteCaseDialog();
        return;
      }
    }
    this.router.transitionTo('cases.case.index');
    this.args.onMoveSubcase();
  });

  @action
  cancelDeleteCase() {
    this.promptDeleteCase = false;
    this.caseToDelete = null;
    this.router.transitionTo('cases.case.index');
  }
}
