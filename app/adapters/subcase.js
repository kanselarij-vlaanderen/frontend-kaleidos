import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({
  findHasMany(store, snapshot, url, relationship) {
    let newUrl = url;
    // Workaround for Ember Data not taking paging into account when fetching a hasMany
    if (relationship.meta.key === 'pieces') {
      newUrl += '?page[size]=9999';
    }
    if (relationship.meta.key === 'linkedPieces') {
      newUrl += '?page[size]=9999';
    }
    return this._super(store, snapshot, newUrl, relationship);
  },
});
