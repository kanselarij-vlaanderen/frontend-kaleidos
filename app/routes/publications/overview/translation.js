import PublicationsOverviewBaseRoute from './_base';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class PublicationsOverviewTranslationRoute extends PublicationsOverviewBaseRoute {
  templateName = 'publications.overview.all';

  defaultColumns = [
    'isUrgent',
    'publicationNumber',
    'shortTitle',
    'numberOfPages',
    'translationRequestDate',
    'translationDueDate',
    'publicationDueDate',
  ];
  tableConfigStorageKey = "publication-table.translation";

  beforeModel() {
    super.beforeModel(...arguments);
    this.filter = {
      status: {
        ':uri:': CONSTANTS.PUBLICATION_STATUSES.TRANSLATION_REQUESTED,
      },
    };
  }
}
