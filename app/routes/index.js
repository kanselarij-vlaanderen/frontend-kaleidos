import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class IndexRoute extends Route {
  @service router;
  @service currentSession;

  beforeModel() {
    this.router.transitionTo(this.currentSession.userGroup?.defaultRoute || 'agendas');
  }
}
