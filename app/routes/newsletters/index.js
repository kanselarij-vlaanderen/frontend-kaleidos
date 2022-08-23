import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class NewslettersIndexRoute extends Route {
  @service store;
  
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
