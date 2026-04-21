import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { subMonths } from 'date-fns';

export default class MonitoringNewsletterRoute extends Route {
  @service conceptStore;
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
  };

  async model(params) {
    const pastDate = subMonths(new Date(), 1).toISOString();
    const options = {
      'filter[:gte:planned-date]': pastDate,
      include: 'meeting.kind',
      sort: params.sort,
      page: {
        number: params.page,
        size: params.size,
      },
    };
    return await this.store.query('themis-publication-activity', options);
  }
}
