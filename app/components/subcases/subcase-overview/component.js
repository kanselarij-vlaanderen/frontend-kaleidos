import Component from '@ember/component';
import { inject } from '@ember/service';
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';

export default Component.extend(DefaultQueryParamsMixin, {
	store: inject(),
	subcases:null,
	modelName: 'subcase',
	sort:"title",

	async didInsertElement() {
		this._super(...arguments);
		this.set('subcases', await this.store.findAll('subcase'))
	},

	actions: {
		selectSubCase() {

		}
	}

})
