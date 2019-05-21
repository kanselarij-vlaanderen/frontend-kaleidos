import Mixin from '@ember/object/mixin';
import { inject } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import { computed } from '@ember/object';

export default Mixin.create({
	store: inject(),
	modelName: null,
	searchField: null,
	propertyToShow: null,
	placeholder: null,
	sortField: null,
	defaultFilter: null,
	defaultSelected: null,
	selectedItems: null,

	items: computed('modelName', async function () {
		const { modelName, searchField, defaultFilter } = this;
		return this.store.query(modelName,
			{
				filter: await defaultFilter,
				sort: searchField,
				page: { size: 50 }
			});
	}),

	searchTask: task(function* (searchValue) {
		yield timeout(300);
		const { searchField, sortField, defaultFilter, modelName } = this;
		let filter = defaultFilter;

		filter[searchField] = searchValue;
		return this.store.query(modelName, {
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
				this.set('items', this.store.peekAll(modelName));
			}
		}
	},
});
