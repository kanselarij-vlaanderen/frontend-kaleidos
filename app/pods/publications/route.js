import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject } from '@ember/service';

export default class PublicationsRoute extends Route.extend(AuthenticatedRouteMixin) {
  @inject store;

  @action
  refreshModel() {
    this.refresh();
  }

  @action
  refresh() {
    super.refresh();
  }

  @action
  async model() {
    // caching for use in publication detail
    const model = {
      publicationModes: await this.store.findAll('publication-mode'),
    };
    return model;
  }
}
