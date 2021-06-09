import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class CasesIndexController extends Controller {
  @service currentSession;

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

  sizeOptions = [5, 10, 20, 50, 100, 200];
  @tracked page = 0;
  @tracked size = 20;
  @tracked sort = '-created';
  @tracked selectedCase = null;
  @tracked isEditingRow = false;
  @tracked isNotArchived = false;
  @tracked isArchivingCase = false;
  @tracked showArchived = false;
  caseToEdit = null;

  @action
  selectSize(size) {
    this.size = size;
  }

  @action
  editRow(_case) {
    this.caseToEdit = _case;
    this.isEditingRow = !this.isEditingRow;
  }

  @action
  async archiveCase() {
    const _case = await this.store.findRecord('case', this.get('selectedCase.id'));
    _case.isArchived = true;
    const subcases = await _case.subcases;
    await Promise.all(subcases.map(async(subcase) => {
      subcase.isArchived = true;
      const savedSubcase = await subcase.save();
      return savedSubcase;
    }));
    _case.save().then(() => {
      this.selectedCase = null;
      this.isArchivingCase = false;
      this.send('refreshModel');
    });
  }

  @action
  async unarchiveCase(_case) {
    _case.isArchived = false;
    const subcases = await _case.subcases;
    await Promise.all(subcases.map(async(subcase) => {
      subcase.isArchived = false;
      const savedSubcase = await subcase.save();
      return savedSubcase;
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
    this.selectedCase = null;
    this.isArchivingCase = false;
  }

  @action
  close(_case) {
    if (!_case) {
      return;
    }
    this.transitionToRoute('cases.case.subcases', _case.id);
  }

  @action
  navigateToCase(_case) {
    this.transitionToRoute('cases.case.subcases', _case.id);
  }
}
