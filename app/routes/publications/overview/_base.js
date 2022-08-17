import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import PublicationTableConfig from 'frontend-kaleidos/utils/publication-table-config';

/**
 * @typedef {
 *  { [relationship: string]: tQueryFilter }
 * } tQueryFilter
 */

/** @abstract */
export default class PublicationsOverviewBaseRoute extends Route {
  @service store;

  defaultColumns;
  tableConfigStorageKey;

  tableConfig;
  filter; // set in subclasses

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
    this.tableConfig = new PublicationTableConfig(this.tableConfigStorageKey, this.defaultColumns);
    this.tableConfig.loadFromLocalStorage();
    if (!this.tableConfig.visibleColumns.length) {
      this.tableConfig.loadDefault();
    }
  }

  model(params) {
    const queryParams = {
      filter: this.filter,
      sort: params.sort,
      page: {
        number: params.page,
        size: params.size,
      },
    };
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
    super.setupController(...arguments);
    controller.tableConfig = this.tableConfig;
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
