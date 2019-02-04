import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
  authenticationRoute: 'mock-login',
  model() {
	return this.store.query('session', {
	  filter: {
		':gt:plannedstart': "",
	  },
	  sort: "number",
	  refresh: true
	});
  },

  actions: {
	refresh() {
	  this.refresh();
	}
  }
});
