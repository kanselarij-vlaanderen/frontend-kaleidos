import PublicationsOverviewBaseRoute from './_base';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { inject as service } from '@ember/service';

const PROOF_STATUSES_URIS = [
  CONSTANTS.PUBLICATION_STATUSES.PROOF_REQUESTED,
  CONSTANTS.PUBLICATION_STATUSES.PROOF_RECALLED,
];

export default class PublicationsOverviewProofRoute extends PublicationsOverviewBaseRoute {
  @service store;

  templateName = 'publications.overview.all';

  defaultColumns = [
    'isUrgent',
    'publicationNumber',
    'numacNumber',
    'shortTitle',
    'numberOfPages',
    'proofRequestDate',
    'publicationDueDate',
  ];
  tableConfigStorageKey = "publication-table.proof";

  beforeModel() {
    super.beforeModel(...arguments);
    const proofStatuses = this.store.peekAll('publication-status').filter((it) => {
      return PROOF_STATUSES_URIS.includes(it.uri);
    });
    this.filter = {
      status: {
        ':id:': proofStatuses.map((s) => s.id).join(','),
      },
    };
  }
}
