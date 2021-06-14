import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

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
    const urgencyLevelPromise = this.store.query('urgency-level', {
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
    const mandateePromise = await this.store.query('mandatee', {
      include: 'person',
      'page[size]': 100,
      sort: 'person.last-name',
    });
    return Promise.all([
      publicationStatusPromise,
      regulationTypePromise,
      urgencyLevelPromise,
      documentTypePromise,
      publicationModePromise,
      mandateePromise
    ]);
  }
}
