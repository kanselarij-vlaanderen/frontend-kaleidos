import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import moment from 'moment';
import { inject } from '@ember/service';


export default Route.extend(AuthenticatedRouteMixin,{
	agendaService: inject(),

	model() {
		const dateOfToday = moment().utc().subtract(1, 'weeks').format();
		return this.store.query('meeting', {
			filter: {
				':gte:planned-start': dateOfToday,
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
