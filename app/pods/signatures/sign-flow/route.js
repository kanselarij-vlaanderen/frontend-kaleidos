import Route from '@ember/routing/route';
import { tracked } from '@glimmer/tracking'

export default class SignaturesSignFlowRoute extends Route {
  model(params) {
    return this.store.queryOne('sign-flow', {
      'filter[:id:]': params.signflow_id,
      include: [
        'sign-subcase',
        'sign-subcase.sign-marking-activity',
        'sign-subcase.sign-marking-activity.piece',
      ]
    })
  }
}
