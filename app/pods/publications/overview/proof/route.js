import Route from '@ember/routing/route';
import { action } from '@ember/object';
import CONSTANTS from 'frontend-kaleidos/config/constants';

const PROOF_REQUESTED_STATUSES_URIS = [
  CONSTANTS.PUBLICATION_STATUSES.PROOF_REQUESTED,
  CONSTANTS.PUBLICATION_STATUSES.PROOF_RECALLED,
];

export default class PublicationsOverviewProofRoute extends Route {
  queryParams = {
    page: {
      refreshModel: true,
      as: 'pagina',
    },
    size: {
      refreshModel: true,
      as: 'aantal',
    },
    sort: {
      refreshModel: true,
      as: 'sorteer',
    },
  };

  async model(params) {
    const publicationStatuses = this.store.peekAll('publication-status');
    const proofRequestedStatuses = publicationStatuses.filter((it) =>
      PROOF_REQUESTED_STATUSES_URIS.includes(it.uri)
    );

    return this.store.query('publication-flow', {
      'filter[status][:id:]': proofRequestedStatuses.mapBy('id').join(','),
      sort: params.sort,
      page: {
        number: params.page,
        size: params.size,
      },
      // eslint-disable-next-line prettier/prettier
      include: [
        'identification',
        'status',
        'publication-subcase',
        'translation-subcase',
        'case',
      ].join(','),
    });
  }

  @action
  loading(transition) {
    // see snippet in https://api.emberjs.com/ember/3.27/classes/Route/events/loading?anchor=loading
    // eslint-disable-next-line ember/no-controller-access-in-routes
    const controller = this.controllerFor(this.routeName);
    controller.isLoadingModel = true;
    transition.promise.finally(() => {
      controller.isLoadingModel = false;
    });
  }
}
