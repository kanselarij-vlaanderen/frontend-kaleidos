import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject } from '@ember/service';

export default class PublicationsRoute extends Route.extend(AuthenticatedRouteMixin) {
  @inject store;

  @action
  async afterModel() {
    // caching for use in publication detail
    await this.store.findAll('publication-mode');
  }
}
