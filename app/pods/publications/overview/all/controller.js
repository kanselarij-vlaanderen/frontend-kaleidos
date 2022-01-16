import Controller from '@ember/controller';
import { action, set } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import tableColumns from 'frontend-kaleidos/config/publications/overview-table-columns';

const defaultColumns = [
  'publicationNumber',
  'shortTitle',
  'publicationDueDate',
  'status',
];

export default class PublicationsOverviewAllController extends Controller {
  page = 0;
  size = 10;
  sort = '-created';

  @tracked columnsDisplayConfig;
  tableColumns = tableColumns;

  @tracked isLoadingModel = false;
  @tracked isColumnsDisplayConfigPanelShown = false;

  constructor() {
    super(...arguments);

    this.initColumnsDisplayConfig();
  }

  initColumnsDisplayConfig() {
    let columnsDisplayConfig = this.loadColumnsDisplayConfig();
    if (!columnsDisplayConfig) {
      columnsDisplayConfig = this.getDefaultColumnsDisplayConfig();
    }
    this.columnsDisplayConfig = columnsDisplayConfig;
  }

  @action
  changeColumnsDisplayConfig(config) {
    this.columnsDisplayConfig = config;
    this.saveColumnsDisplayConfig(this.columnsDisplayConfig);
  }

  @action
  resetColumnsDisplayConfig() {
    this.columnsDisplayConfig = this.getDefaultColumnsDisplayConfig();
    this.saveColumnsDisplayConfig(this.columnsDisplayConfig);
  }

  loadColumnsDisplayConfig() {
    const serializedColumnsDisplayConfig = localStorage.getItem(
      'publications.overview.all/columnsDisplayConfig'
    );
    if (serializedColumnsDisplayConfig) {
      const columnsDisplayConfig = JSON.parse(serializedColumnsDisplayConfig);
      return columnsDisplayConfig;
    }
  }

  saveColumnsDisplayConfig(columnsDisplayConfig) {
    const serializedColumnsDisplayConfig = JSON.stringify(columnsDisplayConfig);
    localStorage.setItem(
      'publications.overview.all/columnsDisplayConfig',
      serializedColumnsDisplayConfig
    );
  }

  getDefaultColumnsDisplayConfig() {
    let columnsDisplayConfig = {};
    for (let column of tableColumns) {
      const columnKey = column.keyName;
      const isColumnShown = defaultColumns.includes(columnKey);
      columnsDisplayConfig[column.keyName] = isColumnShown;
    }
    return columnsDisplayConfig;
  }

  @action
  toggleColumnsDisplayConfigPanel() {
    this.isColumnsDisplayConfigPanelShown =
      !this.isColumnsDisplayConfigPanelShown;
  }

  @action
  prevPage() {
    if (this.page > 0) {
      set(this, 'page', this.page - 1); // TODO: setter instead of @tracked on qp's before updating to Ember 3.22+ (https://github.com/emberjs/ember.js/issues/18715)
    }
  }

  @action
  nextPage() {
    set(this, 'page', this.page + 1); // TODO: setter instead of @tracked on qp's before updating to Ember 3.22+ (https://github.com/emberjs/ember.js/issues/18715)
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
