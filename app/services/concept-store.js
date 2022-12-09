import Service, { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class ConceptStoreService extends Service {
  @service store;

  /** Fetches all concepts that are part of the given concept scheme.
   *
   * @param {string} conceptSchemeUri
   * @param {Object} query: query options passed store.queryAll
   *
   * Note that this call, without any extra query options, is pre-loaded
   * by the cache-warmup-service. If you make changes to this call, make sure
   * to also update the cache-warmup-service.
   */
  queryAllByConceptScheme(conceptSchemeUri, query) {
    query = query || {}; // eslint-disable-line no-param-reassign

    // Remove any keys that filter on [concept-scheme][:uri:]
    // so we don't have an overlap with the filter we set below
    delete query['filter[concept-schemes][:uri]'];
    if (query?.filter?.['concept-schemes']) {
      const conceptSchemesFilter = query.filter['concept-schemes'];
      delete conceptSchemesFilter[':uri:'];
    }

    return this.store.queryAll('concept', {
      ...query,
      'filter[concept-schemes][:uri:]': conceptSchemeUri,
      filter: {
        ...query.filter,
      },
      sort: query.sort ?? 'position',
    });
  }

  /** Fetches all government fields concepts that are part of the concept scheme.
   *
   * The results are sorted on start-date and label to ensure unique sorting.
   * Sorting on position (if needed) should be done after.
   * 
   * Note that this call is pre-loaded by the cache-warmup-service.
   * If you make changes to this call, make sure to also update the cache-warmup-service.
   */
  queryAllGovernmentFields() {
    return this.store.queryAll('concept', {
      'filter[concept-schemes][:uri:]': CONSTANTS.CONCEPT_SCHEMES.BELEIDSVELD,
      filter: {
      },
      sort: 'start-date,label',
    });
  }
}
