import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class CasesCaseSubcasesOverview extends Controller {
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
    const caseModel = await this.store.findRecord('case', this.selectedCase.id);
    caseModel.isArchived = true;
    const subcases = await caseModel.subcases;
    await Promise.all(subcases.map(async(subcase) => {
      subcase.isArchived = true;
      return await subcase.save();
    }));
    caseModel.save()
      .then(() => {
        this.selectedCase = null;
        this.send('refreshModel');
        this.isArchivingCase = false;
      });
  }

  @action
  async unarchiveCase(_case) {
    _case.isArchived = false;
    const dmf = await _case.decisionmakingFlow;
    const subcases = await dmf.subcases;
    await Promise.all(subcases.map(async(subcase) => {
      subcase.isArchived = false;
      return await subcase.save();
    }));
    await _case.save();
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
  navigateToNewCase(dmf) {
    if (!dmf) {
      return;
    }
    this.navigateToDecisionmakingFlow(dmf);
  }

  @action
  navigateToDecisionmakingFlow(dmf) {
    this.router.transitionTo('cases.case.subcases', dmf.id);
  }
}
