import Route from '@ember/routing/route';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes
export default Route.extend({
  model(params) {
    return this.store.findRecord('subcase', params.subcase_id,
      {
        reload: true,
      }).then((subcase) => subcase);
  },

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-actions-hash
  actions: {
    refresh() {
      this._super(...arguments);
      this.refresh();
    },
  },
});
