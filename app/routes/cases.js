import Route from '@ember/routing/route';

export default Route.extend({
  beforeModel() {
    this._super(...arguments);
    //this.transitionTo('cases');
  },
  model() {
    return this.store.findAll('case');
  },
});
