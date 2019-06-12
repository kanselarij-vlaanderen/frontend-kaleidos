import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
	authenticationRoute: 'mock-login',
	modelName: 'agendaitem',
	sort: 'priority',

	model() {
		const filter = {
			agenda: {
				id: this.modelFor('print-overviews.decisions').get('id'),
			},
			subcase: {
				'show-as-remark': false
			},
		};
		this.set('filter', filter);
		return this.store.query('agendaitem', {
			filter,
			sort: this.sort,
			page: {
				size: 10,
				number: this.get('page')
			}
		}).then((items) => {
			return items.toArray();
		})
	},

	setupController(controller) {
		this._super(...arguments)
		controller.set('filter', this.filter);
		controller.set('sort', this.sort);
	},

	actions: {
		refresh() {
			this._super(...arguments);
			this.refresh();
		}
	}
});
