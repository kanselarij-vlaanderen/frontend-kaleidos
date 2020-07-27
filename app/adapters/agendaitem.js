import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({
  findHasMany(store, snapshot, url, relationship) {
    // Workaround for Ember Data not taking paging into account when fetching a hasMany
    const namesOnly = snapshot.adapterOptions && snapshot.adapterOptions.namesOnly;
    if (relationship.meta.key === 'documentVersions') {
      url += '?page[size]=200';
      if (namesOnly) {
        url += '&fields[document-versions]=name';
      }
    }
    if (relationship.meta.key === 'linkedDocumentVersions') {
      url += '?page[size]=200';
    }
    return this._super(store, snapshot, url, relationship);
  },
});
