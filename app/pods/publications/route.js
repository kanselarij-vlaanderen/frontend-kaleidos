import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject } from '@ember/service';
import { hash } from 'rsvp';

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
    const publicationModes = this.store.findAll('publication-mode');

    const model = hash({
      publicationModes: publicationModes,
    });

    return model;
  }
}
