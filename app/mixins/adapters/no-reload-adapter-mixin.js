import Mixin from '@ember/object/mixin';

export default Mixin.create({
  shouldReloadAll(store, snapshot) {
    return false;
  },

  shouldBackgroundReloadAll: function(store, snapshot) {
    return false;
  },
});
