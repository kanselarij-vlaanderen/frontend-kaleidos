import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class SignaturesSignFlowRoute extends Route {
  @service store;

  model(params) {
    return this.store.queryOne('sign-flow', {
      'filter[:id:]': params.signflow_id,
      include: [
        'sign-subcase',
        'sign-subcase.sign-marking-activity',
        'sign-subcase.sign-marking-activity.piece',
      ]
    });
  }
}
