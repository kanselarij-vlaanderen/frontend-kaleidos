import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { inject as service } from '@ember/service';

export default Route.extend(AuthenticatedRouteMixin, {
  currentSession: service(),

  authenticationRoute: 'login',
  redirect() {
    if (!this.currentSession.isEditor) {
      this.transitionTo('');
    }
  },
});
