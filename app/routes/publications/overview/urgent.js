import PublicationsOverviewBaseRoute from './_base';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { inject as service } from '@ember/service';

export default class PublicationsOverviewUrgentRoute extends PublicationsOverviewBaseRoute {
  @service store;

  templateName = 'publications.overview.all';

  defaultColumns = [
    'publicationNumber',
    'numacNumber',
    'shortTitle',
    'numberOfPages',
    'publicationDueDate',
  ];
  tableConfigStorageKey = 'publication-table.urgent';

  beforeModel() {
    super.beforeModel(...arguments);
    const allStatusesExceptPublished = this.store.peekAll('publication-status').filter((s) => !s.isPublished);
    this.filter = {
      'urgency-level': {
        ':uri:': CONSTANTS.URGENCY_LEVELS.SPEEDPROCEDURE,
      },
      status: {
        ':id:': allStatusesExceptPublished.map((s) => s.id).join(','),
      },
    };
  }
}
