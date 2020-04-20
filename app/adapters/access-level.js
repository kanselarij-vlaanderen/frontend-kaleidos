import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({

  // Since headers are set to not cache
  // But we need it cached because we do
  // so many calls
  // we cache it here, bypassing the no-cache header.

  shouldReloadAll(store, snapshot) {
    return !store.peekAll(snapshot.type.modelName).length
  },

  shouldBackgroundReloadAll: function (store, snapshot) {
    return !store.peekAll(snapshot.type.modelName).length
  },

});
