import Route from '@ember/routing/route';

export default class SignaturesIndexRoute extends Route {
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
      sort: params.sort,
      page: {
        number: params.page,
        size: params.size,
      },
      include: [
        'creator',
        'sign-subcase.sign-marking-activity.piece',
        'sign-subcase.sign-marking-activity.piece.document-container.type',
        'decision-activity',
      ].join(','),
    });
  }
}
