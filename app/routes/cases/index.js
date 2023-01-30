import Route from '@ember/routing/route';
import { action } from "@ember/object";

export default class CasesIndexRoute extends Route {
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
    showArchived: {
      refreshModel: true,
      as: 'toon_gearchiveerd',
    },
  };

  model(params) {
    const options = {
      include: 'case',
      sort: params.sort,
      page: {
        number: params.page,
        size: params.size,
      },
    };

    if (!params.showArchived) {
      options['filter[case][is-archived]'] = false;
    }

    return this.store.query('decisionmaking-flow', options);
  }

  @action
  loading(transition) {
    // eslint-disable-next-line ember/no-controller-access-in-routes
    const controller = this.controllerFor(this.routeName);
    controller.isLoadingModel = true;
    transition.promise.finally(() => {
      controller.isLoadingModel = false;
    });
    return true;
  }
}
