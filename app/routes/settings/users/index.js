import Route from '@ember/routing/route';

export default Route.extend({
  model() {
    return this.store.query("user", { sort: 'first-name' }).then(users => users.toArray());
  },

  actions: {
    refresh() {
      this._super(...arguments);
      this.refresh();
    }
  }
});
