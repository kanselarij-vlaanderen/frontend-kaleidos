import Route from '@ember/routing/route';
import { action } from '@ember/object';

/**
 * @typedef {
 *  { [relationship: string]: tQueryFilter }
 * } tQueryFilter
 */

/** @abstract */
export default class PublicationsOverviewBaseRoute extends Route {
  //#region to implement:
  /** @abstract @returns {tQueryFilter} */
  modelGetQueryFilter() {
    console.warn(`${this.modelGetQueryFilter.name} not implemented`);
  }
  //#endregion

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

  async model(params) {
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
  }
}
