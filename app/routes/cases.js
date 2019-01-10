import Route from '@ember/routing/route';

export default Route.extend({
  beforeModel() {
    this._super(...arguments);
    this.transitionTo('cases.create');
  },
  model() {
    return this.store.findAll('case');
  },
});
