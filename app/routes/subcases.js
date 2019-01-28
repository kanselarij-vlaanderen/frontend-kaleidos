import Route from '@ember/routing/route';
import DataTableRouteMixin from 'ember-data-table/mixins/route';

export default Route.extend(DataTableRouteMixin, {
	modelName: 'subcase',

	setupController(controller) {
		controller.set('selectedAgenda', this.modelFor('agendas.agenda'));
		this._super(...arguments);
	}
});
