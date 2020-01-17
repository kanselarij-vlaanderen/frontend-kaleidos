import Route from '@ember/routing/route';
import SortedAgendaItemsRouteMixin from 'fe-redpencil/mixins/sorted-agenda-items-route-mixin';

export default Route.extend(SortedAgendaItemsRouteMixin, {
	type: 'press-agenda',
	include: null,
  allowEmptyGroups: true,
	queryParams: {
		definite: { refreshModel: true }
	},

});
