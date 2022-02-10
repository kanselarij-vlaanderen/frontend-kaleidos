import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import tableColumns from 'frontend-kaleidos/config/publications/overview-table-columns';

export default class PublicationsOverviewBaseController extends Controller {
  /** @abstract @type {string[]} */
  @tracked defaultColumns = [];

  /** @abstract @type {string} */
  @tracked routeName = 'base';

  @tracked page = 0;
  @tracked size = 10;
  @tracked sort = '-created';

  @tracked columnsDisplayConfig;
  tableColumns = tableColumns;

  @tracked isLoadingModel = false;

  @action
  changeColumnsDisplayConfig(config) {
    this.saveColumnsDisplayConfig(this.columnsDisplayConfig);
    this.columnsDisplayConfig = config;
  }

  @action
  resetColumnsDisplayConfig() {
    this.saveColumnsDisplayConfig(this.columnsDisplayConfig);
    this.columnsDisplayConfig = this.getDefaultColumnsDisplayConfig();
  }

  getDefaultColumnsDisplayConfig() {
    const columnsDisplayConfig = {};
    for (let column of tableColumns) {
      const columnKey = column.keyName;
      const isColumnShown = this.defaultColumns.includes(columnKey);
      columnsDisplayConfig[column.keyName] = isColumnShown;
    }
    return columnsDisplayConfig;
  }

  saveColumnsDisplayConfig(columnsDisplayConfig) {
    const serializedColumnsDisplayConfig = JSON.stringify(columnsDisplayConfig);
    localStorage.setItem(
      this.columnsDisplayConfigStorageKey,
      serializedColumnsDisplayConfig
    );
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
