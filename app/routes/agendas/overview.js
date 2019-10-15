import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import moment from 'moment';

export default Route.extend(AuthenticatedRouteMixin,{
	model() {
		const dateOfToday = moment().utc().subtract(1, 'weeks').format();
		return this.store.query('meeting', {
			filter: {
				':gte:planned-start': dateOfToday,
				// 'is-final': false
			}, 
			sort: 'planned-start' });
	},
	actions: {
		refreshRoute() {
			this._super(...arguments);
			this.refresh();
		}
	}
	
});
