import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { MAX_PAGE_SIZES } from 'frontend-kaleidos/config/config';

export default class PublicationsRoute extends Route {
  @service store;
  @service('session') simpleAuthSession;

  beforeModel(transition) {
    this.simpleAuthSession.requireAuthentication(transition, 'login');
  }

  async afterModel() {
    const publicationStatusPromise = this.store.query('publication-status', {
      'page[size]': MAX_PAGE_SIZES.CODE_LISTS,
      sort: 'position',
    });
    const publicationModePromise = this.store.query('publication-mode', {
      'page[size]': MAX_PAGE_SIZES.CODE_LISTS,
      sort: 'position',
    });
    const urgencyLevelPromise = this.store.query('urgency-level', {
      'page[size]': MAX_PAGE_SIZES.CODE_LISTS,
      sort: 'position',
    });
    const regulationTypePromise = this.store.query('regulation-type', {
      'page[size]': MAX_PAGE_SIZES.CODE_LISTS,
      sort: 'position',
    });
    const documentTypePromise =  this.store.query('document-type', {
      'page[size]': MAX_PAGE_SIZES.CODE_LISTS,
      sort: 'priority',
    });

    return Promise.all([
      publicationStatusPromise,
      regulationTypePromise,
      urgencyLevelPromise,
      documentTypePromise,
      publicationModePromise
    ]);
  }
}
