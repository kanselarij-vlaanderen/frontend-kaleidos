import Mixin from '@ember/object/mixin';

export default Mixin.create({
  shouldReloadAll(store, snapshot) {
    return !store.peekAll( snapshot.type.modelName ).length
  },

  shouldBackgroundReloadAll: function(store, snapshot) {
    return !store.peekAll( snapshot.type.modelName ).length
  },
});
