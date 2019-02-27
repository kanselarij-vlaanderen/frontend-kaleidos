import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    return this.store.findRecord('case', params.id, { reload: true });
  },
  redirect() {
    this.transitionTo('cases.case.subcases');
  }
});
