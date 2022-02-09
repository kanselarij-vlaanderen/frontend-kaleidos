import PublicationsOverviewBaseRoute from '../_base/route';
import CONSTANTS from 'frontend-kaleidos/config/constants';

// eslint-disable-next-line prettier/prettier
const PROOFREAD_STATUSES_URIS = [
  CONSTANTS.PUBLICATION_STATUSES.PROOF_IN,
];

export default class PublicationsOverviewProofreadRoute extends PublicationsOverviewBaseRoute {
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
}
