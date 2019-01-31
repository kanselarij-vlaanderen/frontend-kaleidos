import Route from '@ember/routing/route';

export default Route.extend({
  beforeModel() {
    this._super(...arguments);
  },
  model(params) {
    return this.store.findRecord('case', params.id, { reload: true });
  },
  redirect() {
    this.transitionTo('cases.case.subcases');
  }
});
