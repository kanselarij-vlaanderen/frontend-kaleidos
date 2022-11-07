import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';

export default class PublicationsRoute extends Route {
  @service store;
  @service currentSession;
  @service router;
  @service('session') simpleAuthSession;

  beforeModel(transition) {
    this.simpleAuthSession.requireAuthentication(transition, 'login');

    if (!this.currentSession.may('manage-publication-flows')) {
      this.router.transitionTo('index');
    }
  }

  async afterModel() {
    const publicationStatusPromise = this.store.query('publication-status', {
      'page[size]': PAGE_SIZE.CODE_LISTS,
      sort: 'position',
    });
    const publicationModePromise = this.store.query('publication-mode', {
      'page[size]': PAGE_SIZE.CODE_LISTS,
      sort: 'position',
    });
    const urgencyLevelPromise = this.store.query('urgency-level', {
      'page[size]': PAGE_SIZE.CODE_LISTS,
      sort: 'position',
    });
    const regulationTypePromise = this.store.query('regulation-type', {
      'page[size]': PAGE_SIZE.CODE_LISTS,
      sort: 'position',
    });
    const documentTypePromise =  this.store.query('concept', {
      'filter[concept-schemes][:uri:]': CONSTANTS.CONCEPT_SCHEMES.DOCUMENT_TYPES,
      'page[size]': PAGE_SIZE.CODE_LISTS,
      sort: 'position',
    });
    // const documentTypePromise = this.store.queryConceptsForConceptScheme(CONSTANTS.CONCEPT_SCHEMES.DOCUMENT_TYPES);
    // TODO: Enable when https://github.com/kanselarij-vlaanderen/frontend-kaleidos/pull/1518 gets merged

    return Promise.all([
      publicationStatusPromise,
      regulationTypePromise,
      urgencyLevelPromise,
      documentTypePromise,
      publicationModePromise,
    ]);
  }
}
