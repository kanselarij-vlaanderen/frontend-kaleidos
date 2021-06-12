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
  page = 0;
  size = 10;
  sort = '-created';
  showArchived = false;
  @tracked showTableDisplayOptions = false;
  @tracked selectedCase = null;
  @tracked isEditingRow = false;
  @tracked isNotArchived = false;
  @tracked isArchivingCase = false;

  @action
  editCase(_case) {
    this.selectedCase = _case;
    this.isEditingRow = true;
  }

  @action
  cancelEditing() {
    this.selectedCase = null;
    this.isEditingRow = false;
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
    await _case.save();
    this.selectedCase = null;
    this.isArchivingCase = false;
    this.send('refreshModel');
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
    this.navigateToCase(_case);
  }

  @action
  navigateToCase(_case) {
    this.transitionToRoute('cases.case.subcases', _case.id);
  }

  @action
  toggleColumnDisplayOptions() {
    this.showTableDisplayOptions = !this.showTableDisplayOptions;
  }

  @action
  toggleShowArchived() {
    // TODO: setter instead of @tracked on qp's before updating to Ember 3.22+ (https://github.com/emberjs/ember.js/issues/18715)
    this.set('showArchived', !this.showArchived);
  }

  @action
  prevPage() {
    if (this.page > 0) {
      // TODO: setter instead of @tracked on qp's before updating to Ember 3.22+ (https://github.com/emberjs/ember.js/issues/18715)
      this.set('page', this.page - 1);
    }
  }

  @action
  nextPage() {
    // TODO: setter instead of @tracked on qp's before updating to Ember 3.22+ (https://github.com/emberjs/ember.js/issues/18715)
    this.set('page', this.page + 1);
  }

  @action
  setSizeOption(size) {
    // TODO: setters instead of @tracked on qp's before updating to Ember 3.22+ (https://github.com/emberjs/ember.js/issues/18715)
    this.set('size', size);
    this.set('page', 0);
  }
}
