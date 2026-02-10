import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { isEnabledCabinetSubmissions } from 'frontend-kaleidos/utils/feature-flag';
import isSameDay from 'date-fns/isSameDay';

export default class SubCasesOverviewHeader extends Component {
  @service currentSession;
  @service router;
  @service store;
  @service draftSubmissionService;
  @service subcaseService;

  @tracked case;
  @tracked showEditCaseModal = false;
  @tracked publicationFlows;
  @tracked isArchivingCase = false;
  @tracked hasOngoingSubmissions = false;
  @tracked currentSubmission;
  @tracked isOpenDownloadDocumentsModal = false;
  @tracked hasFilesToDownload;

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

  get archivePath() {
    return `/cases/${this.case.id}/pieces/files/archive`;
  }

  get mayCreateSubmissions() {
    return (
      isEnabledCabinetSubmissions() &&
      this.loadData.isIdle &&
      this.loadSubmissionsData.isIdle &&
      this.currentSession.may('create-submissions') &&
      this.router.currentRouteName !== 'cases.case.subcases.new-submission' &&
      this.loadLinkedMandatees.isIdle &&
      this.linkedMandatees?.length &&
      !this.hasOngoingSubmissions
    );
  }

  loadData = task(async () => {
    this.case = await this.args.decisionmakingFlow.case;
    this.publicationFlows = await this.case.publicationFlows;
    await this.loadLinkedMandatees.perform();
    this.hasFilesToDownload = (await this.store.count('piece', {
      'filter[submission-activities][subcase][decisionmaking-flow][:id:]': this.args.decisionmakingFlow.id,
      'filter[:has:file]': true,
    })) > 0;
  });

  loadSubmissionsData = task(async () => {
    this.currentSubmission = null;
    if (isEnabledCabinetSubmissions() && this.currentSession.may('create-submissions')) {
      const latestSubmission = await this.draftSubmissionService.getLatestSubmissionForDecisionmakingFLow(this.args.decisionmakingFlow);
      if (!latestSubmission?.id) {
        this.hasOngoingSubmissions = false;
        return;
      }
      // const submissionSubcase = await latestSubmission?.subcase; // yields null when it exists, cache issue
      const subcase = await this.store.queryOne('subcase', {
        'filter[submissions][:id:]': latestSubmission.id
      });
      if (!subcase?.id) {
        // submission for new subcase is ongoing
        this.hasOngoingSubmissions = true;
        this.currentSubmission = latestSubmission;
        return;
      }
      const relatedAgendas = await this.subcaseService.getRelatedAgendas(subcase);
      if (relatedAgendas.length > 0) {
        this.hasOngoingSubmissions = relatedAgendas[0].agenda.status.uri === CONSTANTS.AGENDA_STATUSSES.DESIGN;
        // second case: the related agenda is closed and postponed, but a new submission is ongoing
        if (
          relatedAgendas[0].agenda.status.uri === CONSTANTS.AGENDA_STATUSSES.APPROVED &&
          relatedAgendas[0].decisionResultCode?.uri === CONSTANTS.DECISION_RESULT_CODE_URIS.UITGESTELD
        ) {
          const isSubmissionOnNewMeeting = !isSameDay(relatedAgendas[0].meeting.plannedStart, (latestSubmission.plannedStart));
          if (isSubmissionOnNewMeeting) {
            this.hasOngoingSubmissions = true;
          }
        }
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

  openDownloadDocumentsModal = () => {
    this.isOpenDownloadDocumentsModal = true;
  }
  
  closeDownloadDocumentsModal = () => {
    this.isOpenDownloadDocumentsModal = false;
  }
}
