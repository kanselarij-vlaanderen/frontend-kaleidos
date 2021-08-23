import Route from '@ember/routing/route';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes
export default Route.extend({
  model(params) {
    return this.store.findRecord('user', params.id);
  },
});
