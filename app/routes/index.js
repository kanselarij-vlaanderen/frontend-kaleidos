import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class IndexRoute extends Route {
  @service router;
  @service currentSession;

  beforeModel() {
    if (this.currentSession.isKortBestek) {
      this.router.transitionTo('newsletters');
    } else {
      this.router.transitionTo('agendas');
    }
  }
}
