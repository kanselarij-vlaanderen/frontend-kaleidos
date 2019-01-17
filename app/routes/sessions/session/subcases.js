import Route from '@ember/routing/route';

export default Route.extend({
	beforeModel() {
    this._super(...arguments);
    this.transitionTo('sessions.session');
  },
  model(params) {
    return this.store.findRecord('session', params.id);
  }
});
