import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class NewslettersIndexRoute extends Route {
  @service('session') simpleAuthSession;

  queryParams = {
    page: {
      refreshModel: true,
    },
    size: {
      refreshModel: true,
    },
    sort: {
      refreshModel: true,
    },
  };

  beforeModel(transition) {
    this.simpleAuthSession.requireAuthentication(transition, 'login');
  }

  async model(params) {
    const queryParams = {
      page: {
        number: params.page,
        size: params.size,
      },
      sort: params.sort,
    };
    return await this.store.query('meeting', queryParams);
  }
}
