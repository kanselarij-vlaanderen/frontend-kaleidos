import Route from '@ember/routing/route';
import DataTableRouteMixin from 'ember-data-table/mixins/route';

export default Route.extend(DataTableRouteMixin, {
  modelName: 'oc-agendaitem',
  
  mergeQueryOptions() {
    let parentModel = this.modelFor('oc.cases.case');
    return {
			filter: {
				'case': {
          'id': parentModel.id
        }
			},
      include: 'meeting'
		};
  },
  
  setupController(controller, model) {
    controller.set('model', model);
    controller.set('case', this.modelFor('oc.cases.case'));
  },
});
