import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class PublicationsRoute extends Route {
  @service store;
  @service('session') simpleAuthSession;

  beforeModel(transition) {
    this.simpleAuthSession.requireAuthentication(transition, 'login');
  }

  async afterModel() {
    // caching for use in publication detail
    await this.store.findAll('publication-mode');
  }
}
