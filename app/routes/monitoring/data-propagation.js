import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { subWeeks } from 'date-fns';

export default class MonitoringDataPropagationRoute extends Route {
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
    const pastDate = subWeeks(new Date(), 3).toISOString();
    const options = {
      'filter[:gte:created]': pastDate,
      include: 'agendas.created-for.kind',
      sort: params.sort,
      page: {
        number: params.page,
        size: params.size,
      },
    };
    return await this.store.query('distributor-job', options);
  }
}