import Route from '@ember/routing/route';
import { action } from '@ember/object';
import CONFIG from 'fe-redpencil/utils/config';

export default class PausedMinisterRoute extends Route {
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
    return this.store.query('publication-flow', {
      filter: {
        ':has:case': 'yes',
        case: {
          ':has:subcases': 'yes',
        },
        status: {
          id: CONFIG.publicationStatusPauzed.id,
        },
      },
      sort: params.sort,
      include: 'case,status',
    });
  }

  @action
  refreshModel() {
    this.refresh();
  }

  @action
  refresh() {
    super.refresh();
  }
}
