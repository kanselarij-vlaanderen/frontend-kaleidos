import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';
export default class PublicationsRoute extends Route {
  @service store;
  @service('session') simpleAuthSession;

  beforeModel(transition) {
    this.simpleAuthSession.requireAuthentication(transition, 'login');
  }

  async afterModel() {
    const publicationStatusPromise = this.store.query('publication-status', {
      'page[size]': 100,
      sort: 'position',
    });
    const publicationModePromise = this.store.query('publication-mode', {
      'page[size]': 100,
      sort: 'position',
    });
    const regulationTypePromise = this.store.query('regulation-type', {
      'page[size]': 100,
      sort: 'position',
    });
    const documentTypePromise =  this.store.query('document-type', {
      'page[size]': 100,
      sort: 'priority',
    });
    return RSVP.all([
      publicationStatusPromise,
      regulationTypePromise,
      documentTypePromise,
      publicationModePromise
    ]);
  }
}
