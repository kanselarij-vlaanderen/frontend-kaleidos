import PublicationsOverviewBaseRoute from './_base';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { inject as service } from '@ember/service';

// eslint-disable-next-line prettier/prettier
const PROOFREAD_STATUSES_URIS = [
  CONSTANTS.PUBLICATION_STATUSES.PROOF_RECEIVED,
];

export default class PublicationsOverviewProofreadRoute extends PublicationsOverviewBaseRoute {
  @service store;

  templateName = 'publications.overview.all';

  defaultColumns = [
    'isUrgent',
    'publicationNumber',
    'numacNumber',
    'shortTitle',
    'numberOfPages',
    'proofReceivedDate',
    'proofPrintCorrector',
    'publicationDueDate'
  ];
  tableConfigStorageKey = "publication-table.proofread";

  beforeModel() {
    super.beforeModel(...arguments);
    const proofreadStatuses = this.store.peekAll('publication-status').filter((it) => {
      return PROOFREAD_STATUSES_URIS.includes(it.uri);
    });
    this.filter = {
      status: {
        ':id:': proofreadStatuses.map((s) => s.id).join(','),
      },
    };
  }
}
