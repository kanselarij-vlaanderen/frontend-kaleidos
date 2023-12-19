import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class SubCasesOverviewHeader extends Component {
  @service store;
  @service router;
  @tracked case;
  @tracked showAddSubcaseModal = false;
  @tracked showEditCaseModal = false;
  @tracked publicationFlows;
  @tracked isArchivingCase = false;
  @tracked selectedCase = null;
  @tracked isNotArchived = false;
  @tracked isArchivingCase = false;
  @tracked currentRoute;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  get currentRoute() {
    return this.args.currentRoute;
  }

  @task
  *loadData() {
    this.case = yield this.args.decisionmakingFlow.case;
    this.selectedCase = this.case;
    this.publicationFlows = yield this.case.publicationFlows;
  }

  @action
  openAddSubcaseModal() {
    this.showAddSubcaseModal = true;
  }

  @action
  closeAddSubcaseModal() {
    this.showAddSubcaseModal = false;
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
  async saveCase(caseData) {
    await this.args.onSaveCase(caseData);
    this.closeEditCaseModal();
  }

  @action
  async onCreateSubcase() {
    await this.args.onCreateSubcase();
    this.closeAddSubcaseModal();
  }

  @action
  transitionBack() {
    if (history.length > 1) {
      history.back();
    }
  }

  @action
  async archiveCase() {
    const caseModel = await this.store.findRecord('case', this.selectedCase.get('id')); // this.selectedCase is a proxy
    caseModel.isArchived = true;
    const decisionmakingFlow = await caseModel.decisionmakingFlow;
    const subcases = await decisionmakingFlow.subcases;
    await Promise.all(subcases.map(async(subcase) => {
      subcase.isArchived = true;
      return await subcase.save();
    }));
    await caseModel.save();
    this.selectedCase = null;
    this.router.transitionTo('cases');
    this.isArchivingCase = false;
  }

  @action
  requestArchiveCase() {
    this.selectedCase = this.case;
    this.isArchivingCase = true;
  }

  @action
  cancelArchiveCase() {
    this.isArchivingCase = false;
    this.selectedCase = null;
  }
}
