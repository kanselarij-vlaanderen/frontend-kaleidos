import Route from '@ember/routing/route';
import { action } from '@ember/object';
import CONFIG from 'fe-redpencil/utils/config';

export default class InProgressNotRoute extends Route {
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

  async model() {
    return await this.store.query('publication-flow', {
      filter: {
        ':has:case': 'yes',
        case: {
          ':has-no:subcases': 'yes',
        },
        status: {
          id: CONFIG.publicationStatusToPublish.id,
        },
      },
      sort: '-created',
      include: 'case',
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
