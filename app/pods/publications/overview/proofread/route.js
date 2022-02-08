import AbstractPublicationsOverviewBaseRoute from '../_base/route';
import CONSTANTS from 'frontend-kaleidos/config/constants';

const PROOFREAD_STATUSES_URIS = [
  CONSTANTS.PUBLICATION_STATUSES.PROOF_IN,
  CONSTANTS.PUBLICATION_STATUSES.PROOF_CORRECTED,
];

export default class PublicationsOverviewProofreadRoute extends AbstractPublicationsOverviewBaseRoute {
  modelGetQueryFilter() {
    const proofreadStatuses = this.getProofreadStatuses();
    const filter = {
      status: {
        ':id:': proofreadStatuses.mapBy('id').join(','),
      },
    };
    return filter;
  }

  getProofreadStatuses() {
    const publicationStatuses = this.store.peekAll('publication-status');
    const proofreadStatuses = publicationStatuses.filter((it) =>
      PROOFREAD_STATUSES_URIS.includes(it.uri)
    );
    return proofreadStatuses;
  }
}
