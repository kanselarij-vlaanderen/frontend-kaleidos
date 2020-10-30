import Route from '@ember/routing/route';
// import CONFIG from 'fe-redpencil/utils/config';
import { action } from '@ember/object';

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

  model() {
    return this.store.query('publication-flow', {
      // filter: {
      //   'publication-flow': {
      //     'publication-status': CONFIG.publicationStatusToPublish,
      //   },
      // },
      include: 'case',
    });
  }

  @action
  refreshModel() {
    this.refresh();
  }
}
