import Route from '@ember/routing/route';
import DataTableRouteMixin from 'ember-data-table/mixins/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(DataTableRouteMixin, AuthenticatedRouteMixin, {
	authenticationRoute: 'mock-login',
	modelName: 'meeting',
	sizes: [5, 10, 20, 50, 100, 200],

	mergeQueryOptions() {
		return { include: 'agendas' };
	},

	actions: {
		refresh() {
			this._super(...arguments);
			this.refresh();
		}
	}
});
