import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {

  redirect() {
    this.transitionTo('agendas.overview');
  },

  actions: {
    refreshRoute() {
      this._super(...arguments);
      this.refresh();
    }
  }
});
