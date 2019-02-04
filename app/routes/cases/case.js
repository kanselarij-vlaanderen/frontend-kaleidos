import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
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
