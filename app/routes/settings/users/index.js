import Route from '@ember/routing/route';
import { isPresent } from '@ember/utils';
import { inject as service } from '@ember/service';
import Snapshot from 'frontend-kaleidos/utils/snapshot';

export default class SettingsUsersIndexRoute extends Route {
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

    const options = {
      sort: params.sort,
      page: {
        number: params.page,
        size: params.size,
      },
      include: 'memberships.organization,memberships.role',
    };

    if (isPresent(params.filter)) {
      options['filter'] = params.filter;
    }

    this.lastParams.commit();

    return this.store.query('user', options);
  }

  setupController(controller) {
    super.setupController(...arguments);

    if (controller.page !== this.lastParams.committed.page) {
      controller.page = this.lastParams.committed.page;
    }
    controller.searchTextBuffer = this.lastParams.committed.filter;
  }
}
