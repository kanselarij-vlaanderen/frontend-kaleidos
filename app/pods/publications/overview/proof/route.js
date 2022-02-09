import PublicationsOverviewBaseRoute from '../_base/route';
import CONSTANTS from 'frontend-kaleidos/config/constants';

const PROOF_STATUSES_URIS = [
  CONSTANTS.PUBLICATION_STATUSES.PROOF_REQUESTED,
  CONSTANTS.PUBLICATION_STATUSES.PROOF_RECALLED,
];

export default class PublicationsOverviewProofRoute extends PublicationsOverviewBaseRoute {
  modelGetQueryFilter() {
    const proofStatuses = this.getProofStatuses();
    const filter = {
      status: {
        ':id:': proofStatuses.mapBy('id').join(','),
      },
    };
    return filter;
  }

  getProofStatuses() {
    const publicationStatuses = this.store.peekAll('publication-status');
    const proofStatuses = publicationStatuses.filter((it) =>
      PROOF_STATUSES_URIS.includes(it.uri)
    );
    return proofStatuses;
  }
}
