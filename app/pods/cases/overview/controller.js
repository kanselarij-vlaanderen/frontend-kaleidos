import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class CasesCaseSubcasesOverview extends Controller {
  // Services
  @service currentSession;
  @service router;

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

  sort = '-created';
  @tracked selectedCase = null;
  @tracked caseToEdit = null;
  @tracked showEditCaseModal = false;
  @tracked isNotArchived = false;
  @tracked isArchivingCase = false;
  showArchived = false;

  @action
  selectSize(size) {
    this.size = size;
  }

  @action
  openEditCaseModal(caze) {
    this.caseToEdit = caze;
    this.showEditCaseModal = true;
  }

  @action
  closeEditCaseModal() {
    this.showEditCaseModal = false;
    this.caseToEdit = null;
  }

  @action
  async saveEditCase(caseData) {
    await caseData.save();
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
  async unarchiveCase(caze) {
    caze.isArchived = false;
    const subcases = await caze.subcases;
    await Promise.all(subcases.map(async(subcase) => {
      subcase.isArchived = false;
      return await subcase.save();
    }));
    await caze.save();
  }

  @action
  requestArchiveCase(caze) {
    this.selectedCase = caze;
    this.isArchivingCase = true;
  }

  @action
  cancelArchiveCase() {
    this.isArchivingCase = false;
    this.selectedCase = null;
  }

  @action
  close(caze) {
    if (!caze) {
      return;
    }
    this.router.transitionTo('cases.case.subcases', caze.id);
  }

  @action
  navigateToCase(_case) {
    this.router.transitionTo('cases.case.subcases', _case.id);
  }
}
