import Component from '@ember/component';
import { inject } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import { computed } from '@ember/object';

export default Component.extend({
	store: inject(),
	modelName:null,
	searchField:null,
	selectedItems: null,
	propertyToShow: null,
	placeholder:null,
	sortField: null,

	items: computed('modelName', function() {
		const modelName = this.get('modelName');
		return this.store.findAll(modelName);
	}), 

	searchTask: task(function* (searchValue) {
		yield timeout(300);
		const filter = {};
		const { searchField, sortField } = this;

		filter[searchField] = searchValue; 
		return this.store.query(this.get('modelName'), {
			filter: filter,
			sort: sortField
		});
	}),

	actions: {
		selectModel(items) {
			this.selectModel(items);
		},

		resetValueIfEmpty(param) {
			if (param == "") {
				const modelName = this.get('modelName');
				this.set('items', this.store.findAll(modelName));
			}
		},
	},
});
