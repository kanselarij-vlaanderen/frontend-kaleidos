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

  @tracked case;
  @tracked showEditCaseModal = false;
  @tracked publicationFlows;
  @tracked isArchivingCase = false;

  constructor() {
    super(...arguments);
    this.loadData.perform();
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
    return (
      this.currentSession.may('create-submissions') &&
      this.loadLinkedMandatees.isIdle &&
      this.linkedMandatees?.length &&
      isEnabledCabinetSubmissions()
    );
  }

  @task
  *loadData() {
    this.case = yield this.args.decisionmakingFlow.case;
    this.publicationFlows = yield this.case.publicationFlows;
  }

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
