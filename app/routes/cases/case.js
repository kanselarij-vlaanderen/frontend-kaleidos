import Route from '@ember/routing/route';

export default Route.extend({
  beforeModel() {
    this._super(...arguments);
  },
  model(params) {
    return this.store.findRecord('case', params.id);
  },
  redirect(model) {
    this.transitionTo('cases.case.subcases');
    if (model.get('length') === 1) {

    }
  }
});
