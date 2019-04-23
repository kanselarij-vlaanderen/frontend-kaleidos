import Component from '@ember/component';
import { inject } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import { computed } from '@ember/object';

export default Component.extend({
	store: inject(),
	modelName: "user",
	sortField: "last-name",
	defaultSelected:null,
	selectedItems: null,

	items: computed('store', function () {
		const { modelName, searchField } = this;
		return this.store.query(modelName, { sort: searchField, page:{size:50 }});
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
		}
	},
});
