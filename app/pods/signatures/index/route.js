import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

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

  @service signatureService;

  async model(params) {
    const signFlows = await this.store.query('sign-flow', {
      sort: params.sort,
      page: {
        number: params.page,
        size: params.size,
      },
      include: [
        'creator',
        'sign-subcase.sign-marking-activity.piece',
        'sign-subcase.sign-marking-activity.piece.document-container.type',
        'sign-subcase.sign-preparation-activity',
        'sign-subcase.sign-signing-activities',
        'decision-activity',
      ].join(','),
    });
    const rowPromises = signFlows.map((signFlow) =>
      this.signatureService.createSignFlowContext(signFlow)
    );
    return Promise.all(rowPromises);
  }
}
