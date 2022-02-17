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

  beforeModel() {
    super.beforeModel(...arguments)
    this.filter = {
      status: {
        ':uri:': CONSTANTS.PUBLICATION_STATUSES.TO_TRANSLATIONS,
      },
    };
  }

  renderTemplate(controller) {
    this.render('publications.overview.all', {
      controller: controller
    });
  }
}
