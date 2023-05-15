import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class SignaturesOngoingRoute extends Route {
  @service currentSession;
  @service store;

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

  model(params) {
    return this.store.query('sign-flow', {
      filter: {
        creator: {
          ':id:': this.currentSession.user.id,
        },
      },
      include: [
        'creator',
        'decision-activity',
        'sign-subcase.sign-marking-activity.piece.document-container.type',
      ].join(','),
      page: {
        number: params.page,
        size: params.size,
      },
      sort: params.sort,
    });
  }
}
