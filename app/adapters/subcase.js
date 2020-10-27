import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({
  findHasMany(store, snapshot, url, relationship) {
    // Workaround for Ember Data not taking paging into account when fetching a hasMany
    if (relationship.meta.key === 'pieces') {
      url += '?page[size]=9999';
    }
    if (relationship.meta.key === 'linkedPieces') {
      url += '?page[size]=9999';
    }
    return this._super(store, snapshot, url, relationship);
  },
});
