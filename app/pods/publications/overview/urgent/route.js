import PublicationsOverviewBaseRoute from '../_base/route';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class PublicationsOverviewUrgentRoute extends PublicationsOverviewBaseRoute {
  defaultColumns = [
    'publicationNumber',
    'numacNumber',
    'shortTitle',
    'numberOfPages',
    'publicationDueDate',
  ];
  tableConfigStorageKey = "publication-table.urgent";

  beforeModel() {
    super.beforeModel(...arguments)
    this.filter = {
      'urgency-level': {
        ':uri:': CONSTANTS.URGENCY_LEVELS.SPEEDPROCEDURE,
      },
    };
  }

  renderTemplate(controller) {
    this.render('publications.overview.all', {
      controller: controller
    });
  }
}
