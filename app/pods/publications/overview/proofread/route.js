import PublicationsOverviewBaseRoute from '../_base/route';
import CONSTANTS from 'frontend-kaleidos/config/constants';

// eslint-disable-next-line prettier/prettier
const PROOFREAD_STATUSES_URIS = [
  CONSTANTS.PUBLICATION_STATUSES.PROOF_IN,
];

export default class PublicationsOverviewProofreadRoute extends PublicationsOverviewBaseRoute {
  defaultColumns = [
    'isUrgent',
    'publicationNumber',
    'numacNumber',
    'shortTitle',
    'pageCount',
    'proofReceivedDate',
    'proofPrintCorrector',
    'publicationDueDate'
  ];

  modelGetQueryFilter() {
    const proofreadStatuses = this.store.peekAll('publication-status').filter((it) => {
      return PROOFREAD_STATUSES_URIS.includes(it.uri);
    });
    const filter = {
      status: {
        ':id:': proofreadStatuses.mapBy('id').join(','),
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
