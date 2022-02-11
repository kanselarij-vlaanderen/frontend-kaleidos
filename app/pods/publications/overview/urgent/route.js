import PublicationsOverviewBaseRoute from '../_base/route';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class PublicationsOverviewUrgentRoute extends PublicationsOverviewBaseRoute {
  defaultColumns = [
    'publicationNumber',
    'numacNumber',
    'shortTitle',
    'pageCount',
    'publicationDueDate',
  ];

  modelGetQueryFilter() {
    const filter = {
      'urgency-level': {
        ':uri:': CONSTANTS.URGENCY_LEVELS.SPEEDPROCEDURE,
      },
    };
    return filter;
  }
}
