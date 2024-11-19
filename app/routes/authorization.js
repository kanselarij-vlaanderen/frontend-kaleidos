import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CallbackRoute extends Route {
  @service router;

  beforeModel() {
    this.router.transitionTo('callback');
  }
}