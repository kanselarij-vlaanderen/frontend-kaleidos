import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin,{

	model() {
		return this.store.query('mandatee', {}).then((mandatees) => {
			return mandatees.sortBy('priority');
		});
	}
});
