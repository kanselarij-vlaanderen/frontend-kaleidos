import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { isEnabledCabinetSubmissions } from 'frontend-kaleidos/utils/feature-flag';

/*
 * @argument subcase
 * @argument onMoveSubcase: from args, the parent route subcases needs to be refreshed after subcase is moved/deleted
 */
export default class SubcasesSubcaseHeaderComponent extends Component {
  @service store;
  @service agendaService;
  @service currentSession;
  @service router;
  @service toaster;
  @service intl;
  @service draftSubmissionService;
  @service parliamentService;

  @tracked isAssigningToAgenda = false;
  @tracked isAssigningToOtherCase = false;
  @tracked newDecisionmakingFlow = null;
  @tracked promptDeleteCase = false;
  @tracked isDeletingSubcase = false;
  @tracked isShowingOptions = false;
  @tracked isLoading = false;
  @tracked isAssigning = false;
  @tracked caseToDelete = null;
  @tracked subcaseToDelete = null;
  @tracked canPropose = false;
  @tracked canDelete = false;
  @tracked canSubmitNewDocuments = false;
  @tracked currentSubmission = null;
  @tracked parliamentRetrievalActivity = null;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  get maySubmitNewDocuments() {
    return (
      isEnabledCabinetSubmissions() &&
      this.loadData.isIdle &&
      this.currentSession.may('create-submissions') &&
      this.submissions?.length > 0 &&
      this.canSubmitNewDocuments
    );
  }

  get canMove() {
    return (
      this.loadData.isIdle &&
        this.currentSession.may('manage-agendaitems') &&
        (!this.args.parliamentFlow ||
      (this.parliamentRetrievalActivity && this.args.subcases.length === 1))
    );
  }

  @task
  *loadData() {
    this.submissions = yield this.args.subcase.hasMany('submissions').reload();
    const activities = yield this.args.subcase.hasMany('agendaActivities').reload();
    this.canPropose = !(activities?.length || this.isAssigningToAgenda || this.isLoading);
    this.canDelete = (this.canPropose && !this.isAssigningToAgenda);
    this.canSubmitNewDocuments = yield this.draftSubmissionService.canSubmitNewDocumentsOnSubcase(this.args.subcase);
    if (!this.canSubmitNewDocuments && this.currentSession.may('view-submissions')) {
      this.currentSubmission = yield this.draftSubmissionService.getOngoingSubmissionForSubcase(this.args.subcase);
    }
    this.parliamentRetrievalActivity = yield this.args.subcase.parliamentRetrievalActivity;
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
    this.newDecisionmakingFlow = null;
  }

  // TODO KAS-3256 We should take another look of the deleting case feature in light of publications also using cases.
  @task
  *deleteCase(_case) {
    const decisionmakingFlow = yield _case.decisionmakingFlow;
    yield _case.destroyRecord();
    yield decisionmakingFlow.destroyRecord();
    this.promptDeleteCase = false;
    this.caseToDelete = null;
    this.router.transitionTo('cases.index');
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

  get hasActions() {
    return this.canDelete || this.canPropose || this.canMove;
  }

  /**
   * @param {boolean} _fullCopy This parameter is unused, we just have it here because the component expects it
   * @param {Meeting} meeting
   * @param {boolean} formallyStatusUri
   * @param {string} privatecomment
   */
  @task
  *proposeForAgenda(_fullCopy, meeting, formallyStatusUri, privateComment) {
    this.isAssigningToAgenda = false;
    this.isLoading = true;
    try {
      yield this.agendaService.putSubmissionOnAgenda(
        meeting,
        this.args.subcase,
        formallyStatusUri,
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

    // onMoveSubcase navigates after refresh
    this.args.onMoveSubcase(decisionmakingFlow);
  }

  @action
  cancelDeleteSubcase() {
    this.isDeletingSubcase = false;
  }

  @action
  triggerMoveSubcaseDialog() {
    this.isAssigningToOtherCase = true;
  }

  @action
  async selectDecisionmakingFlow(newDecisionmakingFlow) {
    this.newDecisionmakingFlow = newDecisionmakingFlow?.id
      ? await this.store.findRecord(
          'decisionmaking-flow',
          newDecisionmakingFlow.id
        )
      : null;
  }

  moveSubcase = task(async () => {
    const oldDecisionmakingFlow = this.args.decisionmakingFlow;

    const oldCase = await oldDecisionmakingFlow.case;
    const newCase = await this.newDecisionmakingFlow.case;

    const parliamentRetrievalActivity = this.parliamentRetrievalActivity;

    for (const submission of this.submissions) {
      submission.decisionmakingFlow = this.newDecisionmakingFlow;
      await submission.save();
    }

    if (parliamentRetrievalActivity) {
      const newParliamentFlow = await newCase.parliamentFlow;
      if (newParliamentFlow) {
        const oldParliamentSubcase = await parliamentRetrievalActivity.parliamentSubcase;
        const oldParliamentFlow = await oldParliamentSubcase.parliamentFlow;

        const newParliamentSubcase = await newParliamentFlow.parliamentSubcase;
        parliamentRetrievalActivity.parliamentSubcase = newParliamentSubcase;

        await parliamentRetrievalActivity.save();
        await oldParliamentSubcase.destroyRecord();
        await oldParliamentFlow.destroyRecord();

        await this.parliamentService.relinkDecisionmakingFlow(
          this.newDecisionmakingFlow,
          newCase,
          newParliamentFlow,
        );
      } else {
        newCase.parliamentFlow = this.args.parliamentFlow;
        await newCase.save();

        oldCase.parliamentFlow = null;
        await oldCase.save();

        await this.parliamentService.relinkDecisionmakingFlow(
          this.newDecisionmakingFlow,
          newCase,
          this.args.parliamentFlow,
        );
      }
    }

    let signFlows = await this.store.queryAll('sign-flow', {
      'filter[sign-subcase][sign-marking-activity][piece][submission-activity][subcase][:id:]': this.args.subcase.id,
    });
    signFlows = signFlows?.slice();
    for (const signFlow of signFlows) {
      signFlow.case = newCase;
      await signFlow.save();
    }

    this.args.subcase.decisionmakingFlow = this.newDecisionmakingFlow;
    await this.args.subcase.save();
    this.isAssigningToOtherCase = false;

    const subcases = await oldDecisionmakingFlow.hasMany('subcases').reload();
    if (subcases.length === 0) {
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
    this.args.onMoveSubcase();
  });

  @action
  cancelDeleteCase() {
    this.promptDeleteCase = false;
    this.caseToDelete = null;
    this.args.onMoveSubcase();
  }
}
