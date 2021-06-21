import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import tableColumns from 'frontend-kaleidos/config/cases/overview-table-columns';

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
  @tracked isLoadingModel = false;
  @tracked showTableDisplayOptions = false;
  @tracked selectedCase = null;
  @tracked isEditingRow = false;
  @tracked isArchivingCase = false;
  @tracked tableColumnDisplayOptions = {};
  tableColumns = tableColumns;

  constructor() {
    super(...arguments);
    tableColumns.forEach((column) => {
      this.tableColumnDisplayOptions[column.keyName] = column.showByDefault;
    });
  }

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
  onClickTableRow(_case, event) {
    // Prevent transition if elements in table row were clicked
    if (event.target.tagName.toLowerCase() === 'td') {
      this.navigateToCase(_case);
    }
  }

  @action
  navigateToCase(_case) {
    this.transitionToRoute('cases.case.subcases', _case.id);
  }

  @action
  changeColumnDisplayOption(optionName, value) {
    this.set(`tableColumnDisplayOptions.${optionName}`, value);
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

  @action
  sortTable(sortField) {
    this.set('sort', sortField);
  }

  @task
  *unarchiveCaseTask(_case) {
    _case.isArchived = false;
    const subcases = yield _case.subcases;
    subcases.forEach((subcase) => {
      subcase.isArchived = false;
      subcase.save();
    });
    yield _case.save();
  }

  @task
  *archiveCaseTask() {
    const _case = yield this.store.findRecord('case', this.selectedCase.id);
    _case.isArchived = true;
    const subcases = yield _case.subcases;
    subcases.forEach((subcase) => {
      subcase.isArchived = true;
      subcase.save();
    });
    yield _case.save();
    this.selectedCase = null;
    this.isArchivingCase = false;
    this.send('refreshModel');
  }
}
