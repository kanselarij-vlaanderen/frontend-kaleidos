import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import tableColumns from 'frontend-kaleidos/config/publications/overview-table-columns';

const defaultColumns = [
  'publicationNumber',
  'numacNumber',
  'shortTitle',
  'publicationTargetDate',
  'publicationDueDate',
];

export default class PublicationsOverviewAllController extends Controller {
  @tracked page = 0;
  @tracked size = 10;
  @tracked sort = '-created';

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
      'publications.overview.late/columnsDisplayConfig',
    );
    if (serializedColumnsDisplayConfig) {
      const columnsDisplayConfig = JSON.parse(serializedColumnsDisplayConfig);
      return columnsDisplayConfig;
    } else {
      return null;
    }
  }

  saveColumnsDisplayConfig(columnsDisplayConfig) {
    const serializedColumnsDisplayConfig = JSON.stringify(columnsDisplayConfig);
    localStorage.setItem(
      'publications.overview.late/columnsDisplayConfig',
      serializedColumnsDisplayConfig
    );
  }

  getDefaultColumnsDisplayConfig() {
    const columnsDisplayConfig = {};
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
      this.page = this.page - 1;
    }
  }

  @action
  nextPage() {
    this.page = this.page + 1;
  }

  @action
  setSizeOption(size) {
    this.size = size;
    this.page = 0;
  }

  @action
  sortTable(sortField) {
    this.sort = sortField;
  }
}
