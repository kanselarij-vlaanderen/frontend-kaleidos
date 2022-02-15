import PublicationsOverviewBaseRoute from '../_base/route';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class PublicationsOverviewTranslationRoute extends PublicationsOverviewBaseRoute {
  defaultColumns = [
    'isUrgent',
    'publicationNumber',
    'shortTitle',
    'pageCount',
    'translationRequestDate',
    'translationDueDate',
    'publicationDueDate',
  ];
  tableConfigStorageKey = "publication-table.translation";

  modelGetQueryFilter() {
    const filter = {
      status: {
        ':uri:': CONSTANTS.PUBLICATION_STATUSES.TO_TRANSLATIONS,
      },
    };
    return filter;
  }

  renderTemplate(controller) {
    this.render('publications.overview.all', {
      controller: controller
    });
  }
}
