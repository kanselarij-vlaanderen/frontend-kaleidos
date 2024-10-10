import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { isEnabledCabinetSubmissions } from 'frontend-kaleidos/utils/feature-flag';

export default class SubCasesOverviewHeader extends Component {
  @service currentSession;
  @service router;
  @service store;
  @service draftSubmissionService;

  @tracked case;
  @tracked showEditCaseModal = false;
  @tracked publicationFlows;
  @tracked isArchivingCase = false;
  @tracked hasOngoingSubcases = false;

  constructor() {
    super(...arguments);
    this.loadData.perform();
    this.loadSubmissionsData.perform();
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
    return (
      this.loadData.isIdle &&
      this.loadSubmissionsData.isIdle &&
      this.currentSession.may('create-submissions') &&
      this.router.currentRouteName !== 'cases.case.subcases.new-submission' &&
      this.loadLinkedMandatees.isIdle &&
      this.linkedMandatees?.length &&
      !this.hasOngoingSubcases &&
      isEnabledCabinetSubmissions()
    );
  }

  @task
  *loadData() {
    this.case = yield this.args.decisionmakingFlow.case;
    this.publicationFlows = yield this.case.publicationFlows;
    yield this.loadLinkedMandatees.perform();
  }

  loadSubmissionsData = task(async () => {
    if (isEnabledCabinetSubmissions() && this.currentSession.may('create-submissions') && this.args.latestSubcase?.id) {
      const latestSubmission = await this.draftSubmissionService.getLatestSubmissionForSubcase(this.args.latestSubcase);
      const meeting = await latestSubmission?.meeting;
      if (meeting?.id) {
        // TODO does this work reproposed/retracted subcases?
        const latestDecisionActivity = await this.store.queryOne('decision-activity', {
          'filter[subcase][:id:]': this.args.latestSubcase.id,
          'filter[treatment][agendaitems][agenda][created-for][:id:]': meeting.id,
          sort: '-start-date',
        });
        // when the decision-activity is propagated the meeting should be final.
        this.hasOngoingSubcases = latestDecisionActivity?.id ? false : true;
      }
    }
  });

  @action
  openEditCaseModal() {
    this.showEditCaseModal = true;
  }

  @action
  closeEditCaseModal() {
    this.showEditCaseModal = false;
  }

  @action
  openArchiveCaseModal() {
    this.isArchivingCase = true;
  }

  @action
  closeArchiveCaseModal() {
    this.isArchivingCase = false;
  }

  @action
  async saveCase() {
    await this.case.save();
    this.closeEditCaseModal();
  }

  @action
  transitionBack() {
    if (history.length > 1) {
      history.back();
    }
  }

  @action
  async archiveCase() {
    const decisionmakingFlow = await this.case.decisionmakingFlow;
    decisionmakingFlow.closed = new Date();
    await decisionmakingFlow.save();
    this.router.refresh();
    this.isArchivingCase = false;
  }

  @action
  async unArchiveCase() {
    const decisionmakingFlow = await this.case.decisionmakingFlow;
    decisionmakingFlow.closed = null;
    await decisionmakingFlow.save();
    this.router.refresh();
  }

  @action
  navigateToAddSubcase() {
    this.router.transitionTo('cases.case.subcases.add-subcase', this.args.decisionmakingFlow.id);
  }

  @action
  navigateToAddSubmission() {
    this.router.transitionTo('cases.case.subcases.new-submission', this.args.decisionmakingFlow.id);
  }
}
