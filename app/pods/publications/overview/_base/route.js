import Route from '@ember/routing/route';
import { action } from '@ember/object';

/**
 * @typedef {
 *  { [relationship: string]: tQueryFilter }
 * } tQueryFilter
 */

/** @abstract */
export default class PublicationsOverviewBaseRoute extends Route {
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

  model(params) {
    const filter = this.modelGetQueryFilter();
    return this.store.query('publication-flow', {
      filter: filter,
      sort: params.sort,
      page: {
        number: params.page,
        size: params.size,
      },
      // eslint-disable-next-line prettier/prettier
      include: [
        'identification',
        'status',
        'publication-subcase',
        'translation-subcase',
        'case',
      ].join(','),
    });
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
    let columnsDisplayConfig = this.loadColumnsDisplayConfig();
    if (!columnsDisplayConfig) {
      columnsDisplayConfig = controller.getDefaultColumnsDisplayConfig();
    }
    controller.columnsDisplayConfig = columnsDisplayConfig;
  }

  get columnsDisplayConfigStorageKey() {
    return `${this.routeName}/columnsDisplayConfig`;
  }

  loadColumnsDisplayConfig() {
    console.log("loading display config for route in route", this.columnsDisplayConfigStorageKey);
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
}
