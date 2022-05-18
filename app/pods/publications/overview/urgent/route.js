import PublicationsOverviewBaseRoute from '../_base/route';
import CONSTANTS from 'frontend-kaleidos/config/constants';

const NOT_PUBLISHED_STATUSES_URIS = [
  CONSTANTS.PUBLICATION_STATUSES.STARTED,
  CONSTANTS.PUBLICATION_STATUSES.TRANSLATION_REQUESTED,
  CONSTANTS.PUBLICATION_STATUSES.TRANSLATION_RECEIVED,
  CONSTANTS.PUBLICATION_STATUSES.PROOF_REQUESTED,
  CONSTANTS.PUBLICATION_STATUSES.PROOF_RECEIVED,
  CONSTANTS.PUBLICATION_STATUSES.PROOF_RECALLED,
  CONSTANTS.PUBLICATION_STATUSES.PROOF_CORRECTED,
  CONSTANTS.PUBLICATION_STATUSES.PUBLICATION_REQUESTED,
  CONSTANTS.PUBLICATION_STATUSES.WITHDRAWN,
  CONSTANTS.PUBLICATION_STATUSES.PAUSED,
];

export default class PublicationsOverviewUrgentRoute extends PublicationsOverviewBaseRoute {
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
    const notPublishedStatuses = this.store
      .peekAll('publication-status')
      .filter((status) => {
        return NOT_PUBLISHED_STATUSES_URIS.includes(status.uri);
      });
    this.filter = {
      'urgency-level': {
        ':uri:': CONSTANTS.URGENCY_LEVELS.SPEEDPROCEDURE,
      },
      status: {
        ':id:': notPublishedStatuses.mapBy('id').join(','),
      },
    };
  }

  renderTemplate(controller) {
    this.render('publications.overview.all', {
      controller: controller,
    });
  }
}
