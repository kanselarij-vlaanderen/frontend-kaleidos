import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import tableColumns from 'frontend-kaleidos/config/publications/overview-table-columns';

const defaultColumns = [
  'publicationNumber',
  'shortTitle',
  'publicationDueDate',
  'status',
];

export default class AbstractPublicationsOverviewBaseController extends Controller {
  // #region to implement:
  /* eslint-disable getter-return */
  /** @abstract @type {string[]} */
  get defaultColumns() {
    console.warn(`defaultColumns not implemented`);
  }

  /** @abstract @type {string} */
  get routeName() {
    console.warn(`routeName not implemented`);
  }
  /* eslint-enable getter-return */
  //#endregion

  @tracked page = 0;
  @tracked size = 10;
  @tracked sort = '-created';

  @tracked columnsDisplayConfig;
  tableColumns = tableColumns;

  @tracked isLoadingModel = false;
  @tracked isColumnsDisplayConfigPanelShown = false;

  // init hook is needed because the concrete controller fields
  //  are set after base controller's constructor has run
  // eslint-disable-next-line ember/classic-decorator-hooks
  init() {
    super.init(...arguments);
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

  get columnsDisplayConfigStorageKey() {
    return `publications.overview.${this.routeName}/columnsDisplayConfig`;
  }

  loadColumnsDisplayConfig() {
    const serializedColumnsDisplayConfig = localStorage.getItem(
      this.columnsDisplayConfigStorageKey
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
      this.columnsDisplayConfigStorageKey,
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
