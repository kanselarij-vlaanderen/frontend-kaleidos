import Route from '@ember/routing/route';
import { action } from "@ember/object";
import { inject as service } from '@ember/service';

export default class AgendaSubmissionsRoute extends Route {
  @service store;
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
    showArchivedOnly: {
      refreshModel: true,
      as: 'toon_enkel_gearchiveerd',
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
      'filter[id]': '6493E1E66C91A50FD9CECC7C',
    };
    if (params.showArchivedOnly) {
      options['filter[case][is-archived]'] = true;
    } else {
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
