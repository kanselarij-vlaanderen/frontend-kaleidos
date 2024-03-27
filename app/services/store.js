import Store from '@ember-data/store';
import ArrayProxy from '@ember/array/proxy';

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
      return results[0];
    }
    return null;
  }

  async queryAll(modelName, query, options) {
    query = query || {}; // eslint-disable-line no-param-reassign
    const batchSize = query.page?.size || 100;

    const firstBatch = this.query(modelName, Object.assign({}, query, {
      'page[size]': batchSize,
      'page[number]': 0,
    }));

    const batches = [firstBatch];
    const result = await firstBatch;
    const count = result.meta.count;

    const nbOfBatches = Math.ceil(count / batchSize);
    for (let i = 1; i < nbOfBatches; i++) {
      const queryForBatch = Object.assign({}, query, {
        'page[size]': batchSize,
        'page[number]': i,
      });
      const batch = this.query(modelName, queryForBatch, options);
      batches.push(batch);
    }

    const results = await Promise.all(batches);
    return ArrayProxy.create({
      content: results.map((result) => result.slice()).flat(),
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
    const cachedRecord = this.peekAll(modelName).find(
      (model) => model.uri === uri
    );
    if (cachedRecord) {
      return cachedRecord;
    }
    return this.queryOne(modelName, {
      'filter[:uri:]': uri,
    });
  }
}
