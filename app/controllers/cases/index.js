import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class CasesIndexController extends Controller {
  // Services
  @service currentSession;
  @service router;
  @service store;

  queryParams = [
    {
      page: {
        type: 'number',
      },
    },
    {
      size: {
        type: 'number',
      },
    },
    {
      sort: {
        type: 'string',
      },
    },
    {
      showArchived: {
        type: 'boolean',
      },
    }
  ];
  sizeOptions = Object.freeze([5, 10, 20, 50, 100, 200]);
  page = 0;
  size = 20;

  sort = '-opened';
  showArchived = false;
  @tracked isLoadingModel;
  @tracked selectedCase = null;
  @tracked caseToEdit = null;
  @tracked showEditCaseModal = false;
  @tracked isNotArchived = false;
  @tracked isArchivingCase = false;

  @action
  selectSize(size) {
    this.size = size;
  }

  @action
  async openEditCaseModal(_case) {
    this.caseToEdit = await _case;
    this.showEditCaseModal = true;
  }

  @action
  closeEditCaseModal() {
    this.showEditCaseModal = false;
    this.caseToEdit = null;
  }

  @action
  async saveEditCase(_case) {
    await _case.save();
    this.closeEditCaseModal();
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
    this.router.refresh();
    this.isArchivingCase = false;
  }

  @action
  async unarchiveCase(_case) {
    const caseModel = await this.store.findRecord('case', _case.get('id')); // _case is a proxy
    caseModel.isArchived = false;
    const decisionmakingFlow = await caseModel.decisionmakingFlow;
    const subcases = await decisionmakingFlow.subcases;
    await Promise.all(subcases.map(async(subcase) => {
      subcase.isArchived = false;
      return await subcase.save();
    }));
    await caseModel.save();
    this.router.refresh();
  }

  @action
  requestArchiveCase(_case) {
    this.selectedCase = _case;
    this.isArchivingCase = true;
  }

  @action
  cancelArchiveCase() {
    this.isArchivingCase = false;
    this.selectedCase = null;
  }

  @action
  navigateToDecisionmakingFlow(decisionmakingFlow) {
    this.router.transitionTo('cases.case.subcases', decisionmakingFlow.id);
  }
}
