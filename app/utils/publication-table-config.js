import tableColumns from 'frontend-kaleidos/config/publications/overview-table-columns';
import { tracked } from '@glimmer/tracking';
import { TrackedSet } from 'tracked-built-ins';

export default class PublicationTableConfig {
  localStorageKey;
  defaultColumnKeys;
  allColumnKeys;

  @tracked visibleColumnKeys = new TrackedSet();

  constructor(localStorageKey, defaultColumnKeys=[]) {
    this.localStorageKey = localStorageKey;
    this.defaultColumnKeys = defaultColumnKeys;
    this.allColumnKeys = tableColumns.map(c => c.keyName);
  }

  get visibleColumns() {
    return tableColumns
      .filter((column) => this.visibleColumnKeys.has(column.keyName));
  }

  loadFromLocalStorage() {
    const serializedColumnVisibilityConfig = localStorage.getItem(
      this.localStorageKey
    );
    if (serializedColumnVisibilityConfig) {
      const columnsDisplayConfig = JSON.parse(serializedColumnVisibilityConfig);
      this.visibleColumnKeys = new TrackedSet(
        Object.entries(columnsDisplayConfig)
          .filter(([_, value]) => { //eslint-disable-line no-unused-vars
            return value;
          })
          .map(([key, _]) => { //eslint-disable-line no-unused-vars
            return key;
          })
      );
      return this.visibleColumnKeys;
    }
  }

  getSerializedVisibilityConfig() {
    const columnsVisibilityConfig = {};
    tableColumns.forEach((column) => {
      columnsVisibilityConfig[column.keyName] =
        this.visibleColumnKeys.has(column.keyName);
    });
    return JSON.stringify(columnsVisibilityConfig);
  }

  saveToLocalStorage() {
    const serializedColumnsDisplayConfig = this.getSerializedVisibilityConfig();
    localStorage.setItem(this.localStorageKey, serializedColumnsDisplayConfig);
  }

  loadDefault() {
    this.visibleColumnKeys = new TrackedSet(this.defaultColumnKeys);
    return this.visibleColumns;
  }
}
