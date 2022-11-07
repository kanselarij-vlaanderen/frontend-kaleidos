import Service, { inject as service } from '@ember/service';

export default class ConceptStoreService extends Service {
  @service store;

  allForConceptScheme(conceptSchemeUri, query) {
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
}
