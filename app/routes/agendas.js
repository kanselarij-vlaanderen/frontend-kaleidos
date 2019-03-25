import Route from '@ember/routing/route';
import DataTableRouteMixin from 'ember-data-table/mixins/route';

export default Route.extend(DataTableRouteMixin, {
	modelName: 'meeting',

	mergeQueryOptions() {
		return { include: 'agendas' };
	},

  actions: {
	refresh() {
	  this.refresh();
	}
  }
});
