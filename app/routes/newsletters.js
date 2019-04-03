import Route from '@ember/routing/route';
import DataTableRouteMixin from 'ember-data-table/mixins/route';

export default Route.extend(DataTableRouteMixin, {
	modelName: 'meeting',
	sizes: [5,10,20,50,100,200],

	mergeQueryOptions() {
		return { include: 'agendas' };
	},

	actions: {
		refresh() {
			this.refresh();
		}
	}
});
