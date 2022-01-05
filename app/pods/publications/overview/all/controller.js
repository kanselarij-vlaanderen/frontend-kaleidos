import Controller from '@ember/controller';
import { action, set } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import tableColumns from 'frontend-kaleidos/config/publications/overview-table-columns';

const defaultColumns = [
  'publicationNumber',
  'shortTitle',
  'publicationDueDate',
  'status'
]

export default class PublicationsOverviewAllController extends Controller {
  queryParams = {
    page: {
      type: 'number',
    },
    size: {
      type: 'number',
    },
    sort: {
      type: 'string',
    },
  };

  page = 0;
  size = 10;
  sort = '-created';

  @tracked tableColumnDisplayOptions;
  tableColumns = tableColumns;

  @tracked isLoadingModel = false;
  @tracked showTableDisplayOptions = false;

  constructor() {
    super(...arguments);

    this.initColumnsConfig();
  }

  @action
  navigateToPublication(publicationFlowRow) {
    this.transitionToRoute('publications.publication', publicationFlowRow.get('id'));
  }

  initColumnsConfig() {
    let columnsConfig = this.loadColumnsConfig();
    if (!columnsConfig) {
      columnsConfig = this.getDefaultColumnsConfig();
    }
    this.tableColumnDisplayOptions = columnsConfig;
  }

  @action
  changeColumnDisplayOptions(options) {
    this.tableColumnDisplayOptions = options;
    this.saveColumnsConfig(this.tableColumnDisplayOptions);
  }

  loadColumnsConfig() {
    const serializedColumnsConfig = localStorage.getItem('publications.overview.all/columns');
    if (serializedColumnsConfig) {
      const columnsConfig = JSON.parse(serializedColumnsConfig);
      return columnsConfig;
    }
  }

  saveColumnsConfig(columnsConfig) {
    const serializedColumnsConfig = JSON.stringify(columnsConfig);
    localStorage.setItem('publications.overview.all/columns', serializedColumnsConfig);
  }

  getDefaultColumnsConfig() {
    let columnsConfig = {};
    for (let column of tableColumns) {
      const columnKey = column.keyName;
      const isColumnShown = defaultColumns.includes(columnKey);
      columnsConfig[column.keyName] = isColumnShown;
    }
    return columnsConfig;
  }

  @action
  toggleColumnDisplayOptions() {
    this.showTableDisplayOptions = !this.showTableDisplayOptions;
  }

  @action
  prevPage() {
    if (this.page > 0) {
      set(this, 'page', this.page - 1); // TODO: setter instead of @tracked on qp's before updating to Ember 3.22+ (https://github.com/emberjs/ember.js/issues/18715)
    }
  }

  @action
  nextPage() {
    set(this, 'page', this.page + 1);  // TODO: setter instead of @tracked on qp's before updating to Ember 3.22+ (https://github.com/emberjs/ember.js/issues/18715)
  }

  @action
  setSizeOption(size) {
    // TODO: setters instead of @tracked on qp's before updating to Ember 3.22+ (https://github.com/emberjs/ember.js/issues/18715)
    set(this, 'size', size);
    set(this, 'page', 0);
  }

  @action
  sortTable(sortField) {
    // TODO: setters instead of @tracked on qp's before updating to Ember 3.22+ (https://github.com/emberjs/ember.js/issues/18715)
    set(this, 'sort', sortField);
  }
}
