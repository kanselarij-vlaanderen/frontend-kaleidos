import Store from 'ember-data/store';
import CONSTANTS from 'frontend-kaleidos/config/constants';


export default class ExtendedStoreService extends Store {
  /*
   * Executes regulare "query"-method. Queries for only one result and returns that if any.
   */
  async queryOne(modelName, query, options) {
    if (!(query['page[size]'] || (query.page && query.page.size))) {
      query['page[size]'] = CONSTANTS.MAX_PAGE_SIZES.ONE_ITEM;
    }
    const results = await this.query(modelName, query, options);
    if (results.length) {
      return results.firstObject;
    }
    return null;
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
}
