import Route from '@ember/routing/route';
import DataTableRouteMixin from 'ember-data-table/mixins/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(DataTableRouteMixin, AuthenticatedRouteMixin, {
	authenticationRoute: 'mock-login',
	modelName: 'agendaitem',

	mergeQueryOptions() {
		return {
			filter: {
				agenda: {
					id: this.modelFor('print-overviews.decisions').get('id')
				},
				subcase: {
					'show-as-remark': false
				}
			}
		};
	},

	actions: {
		refresh() {
			this._super(...arguments);
			this.refresh();
		}
	}
});
