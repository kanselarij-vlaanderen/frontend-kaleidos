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
  tableConfigStorageKey = "publication-table.proofread";

  beforeModel() {
    super.beforeModel(...arguments)
    const proofreadStatuses = this.store.peekAll('publication-status').filter((it) => {
      return PROOFREAD_STATUSES_URIS.includes(it.uri);
    });
    this.filter = {
      status: {
        ':id:': proofreadStatuses.mapBy('id').join(','),
      },
    };
  }

  renderTemplate(controller) {
    this.render('publications.overview.all', {
      controller: controller
    });
  }
}
