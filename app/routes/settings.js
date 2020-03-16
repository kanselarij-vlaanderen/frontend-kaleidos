import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Route.extend(AuthenticatedRouteMixin,isAuthenticatedMixin, {
	authenticationRoute: 'login',
  redirect() {
		if (!this.isEditor) {
			this.transitionTo('');
		}
	}
});
