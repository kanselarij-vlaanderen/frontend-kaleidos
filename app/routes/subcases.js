import Route from '@ember/routing/route';
import DataTableRouteMixin from 'ember-data-table/mixins/route';

export default Route.extend(DataTableRouteMixin, {
	modelName: 'subcase',
	queryParams: {
		agendaId: {
			refreshModel: true
		}
	},

	mergeQueryOptions(params) {
    return { 'filter[agenda]': params.title };
  }
});
