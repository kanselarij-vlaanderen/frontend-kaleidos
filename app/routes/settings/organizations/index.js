import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Snapshot from 'frontend-kaleidos/utils/snapshot';

export default class SettingsOrganizationsIndexRoute extends Route {
  @service store;

  queryParams = {
    filter: {
      refreshModel: true,
    },
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
    organizations: {
      refreshModel: true,
      as: 'organisaties',
    },
  };

  constructor() {
    super(...arguments);
    this.lastParams = new Snapshot();
  }

  model(params) {
    this.lastParams.stageLive(params);

    if (this.lastParams.anyFieldChanged(Object.keys(params).filter((key) => key !== 'page'))) {
      params.page = 0;
    }

    const filter = {};

    if (params.organizations.length) {
      filter[':id:'] = params.organizations.join(',');
    }

    const options = {
      filter,
      sort: params.sort,
      page: {
        number: params.page,
        size: params.size,
      },
      include: 'status',
    };

    this.lastParams.commit();

    return this.store.query('user-organization', options);
  }

  setupController(controller) {
    super.setupController(...arguments);

    if (controller.page !== this.lastParams.committed.page) {
      controller.page = this.lastParams.committed.page;
    }
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
