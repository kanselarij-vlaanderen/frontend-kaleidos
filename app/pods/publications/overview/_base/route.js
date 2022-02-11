import Route from '@ember/routing/route';
import { action } from '@ember/object';
import tableColumns from 'frontend-kaleidos/config/publications/overview-table-columns';

/**
 * @typedef {
 *  { [relationship: string]: tQueryFilter }
 * } tQueryFilter
 */

/** @abstract */
export default class PublicationsOverviewBaseRoute extends Route {
  defaultColumns;
  columnsDisplayConfig;
  includes;

  /** @abstract @returns {tQueryFilter} */
  modelGetQueryFilter() {
    console.warn(`${this.modelGetQueryFilter.name} not implemented`);
  }

  queryParams = {
    page: {
      refreshModel: true,
      as: 'pagina',
    },
    size: {
      refreshModel: true,
      as: 'aantal',
    },
    sort: {
      refreshModel: true,
      as: 'sorteer',
    },
  };

  beforeModel() {
    // load which columns the user wants to be shown
    this.columnsDisplayConfig = this.loadColumnsDisplayConfig();
    if (!this.columnsDisplayConfig) {
      this.columnsDisplayConfig = this.getDefaultColumnsDisplayConfig();
    }

    // determine which included data the visible columns require
    let requiredFieldPaths = [];
    for (const column of tableColumns) {
      if (this.columnsDisplayConfig[column.keyName]) {
        requiredFieldPaths = requiredFieldPaths.concat(column.apiFieldPaths);
      }
    }
    // Filter for field-paths that are more than 1 hop away, thus requiring an include
    const pathsRequiringInclude = requiredFieldPaths.filter((path) => {
      return path.includes('.');
    }).map((path) => {
      return path.split('.').slice(0, -1).join('.');
    });

    const uniqueIncludes = [...new Set(pathsRequiringInclude)];
    this.includes = uniqueIncludes;
  }

  model(params) {
    const filter = this.modelGetQueryFilter();
    const queryParams = {
      filter: filter,
      sort: params.sort,
      page: {
        number: params.page,
        size: params.size,
      },
    };
    if (this.includes.length) {
      queryParams.include = this.includes.join(',');
    }
    return this.store.query('publication-flow', queryParams);
  }

  @action
  loading(transition) {
    // see snippet in https://api.emberjs.com/ember/3.27/classes/Route/events/loading?anchor=loading
    // eslint-disable-next-line ember/no-controller-access-in-routes
    const controller = this.controllerFor(this.routeName);
    controller.isLoadingModel = true;
    transition.promise.finally(() => {
      controller.isLoadingModel = false;
    });

    // only bubble loading event when transitioning between tabs
    // to enable loading template to be shown
    if (transition.from && transition.to) {
      return transition.from.name != transition.to.name;
    } else {
      return true;
    }
  }

  setupController(controller) {
    controller.columnsDisplayConfigStorageKey = this.columnsDisplayConfigStorageKey;
    controller.columnsDisplayConfig = this.columnsDisplayConfig;
    controller.getDefaultColumnsDisplayConfig = this.getDefaultColumnsDisplayConfig;
  }

  get columnsDisplayConfigStorageKey() {
    return `${this.routeName}/columnsDisplayConfig`;
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

  getDefaultColumnsDisplayConfig() {
    const columnsDisplayConfig = {};
    for (let column of tableColumns) {
      const columnKey = column.keyName;
      const isColumnShown = this.defaultColumns.includes(columnKey);
      columnsDisplayConfig[column.keyName] = isColumnShown;
    }
    return columnsDisplayConfig;
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
