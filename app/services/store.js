import Store from '@ember-data/store';
import ArrayProxy from '@ember/array/proxy';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';

export default class ExtendedStoreService extends Store {
  /*
   * Executes regulare "query"-method. Queries for only one result and returns that if any.
   */
  async queryOne(modelName, query, options) {
    query = query || {}; // eslint-disable-line no-param-reassign
    if (!(query['page[size]'] || (query.page && query.page.size))) {
      query['page[size]'] = 1;
    }
    const results = await this.query(modelName, query, options);
    if (results.length) {
      return results.firstObject;
    }
    return null;
  }

  async queryAll(modelName, query, options) {
    query = query || {}; // eslint-disable-line no-param-reassign
    const count = await this.count(modelName, query, options);
    const batchSize = query.page?.size || 100;
    const nbOfBatches = Math.ceil(count / batchSize);
    const batches = [];
    for (let i = 0; i < nbOfBatches; i++) {
      const queryForBatch = Object.assign({}, query, {
        'page[size]': batchSize,
        'page[number]': i,
      });
      const batch = this.query(modelName, queryForBatch, options);
      batches.push(batch);
    }

    const results = await Promise.all(batches);
    return ArrayProxy.create({
      content: results.map((result) => result.toArray()).flat(),
      meta: {
        count
      }
    });
  }

  async count(modelName, query, options) {
    query = query || {}; // eslint-disable-line no-param-reassign
    if (!(query['page[size]'] || (query.page && query.page.size))) {
      query['page[size]'] = 1;
    }
    const results = await this.query(modelName, query, options);
    const count = results.meta.count;
    return count;
  }

  findRecordByUri(modelName, uri) {
    const cachedRecord = this.peekAll(modelName).findBy('uri', uri);
    if (cachedRecord) {
      return cachedRecord;
    }
    return this.queryOne(modelName, {
      'filter[:uri:]': uri,
    });
  }

  // TODO: Move this to a concept-service where we bundle logic for getting
  // all concepts of a scheme/specific concepts? Might cut down some of the
  // repetition across the codebase.
  queryConceptsForConceptScheme(conceptSchemeUri) {
    return this.query('concept', {
      'filter[concept-schemes][:uri:]': conceptSchemeUri,
      'filter[:has-no:narrower]': true,
      include: 'broader,narrower',
      'page[size]': PAGE_SIZE.CODE_LISTS,
      sort: 'position',
    });
  }
}
