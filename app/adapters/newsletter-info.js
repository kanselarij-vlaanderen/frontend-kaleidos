import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({
  findHasMany (store, snapshot, url, relationship) {
    // Workaround for Ember Data not taking paging into account when fetching a hasMany
    if (relationship.meta.key === 'documentVersions') {
      url = url + '?page[size]=9999'
    }
    if (relationship.meta.key === 'linkedDocumentVersions') {
      url = url + '?page[size]=9999'
    }
    return this._super(store, snapshot, url, relationship);
  }
});
