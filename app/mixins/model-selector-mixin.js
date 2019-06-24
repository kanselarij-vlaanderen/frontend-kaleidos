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
	loadingMessage: "Even geduld aub..",
	noMatchesMessage: "Geen zoekresultaten gevonden",
	defaultSelected: null,
	selectedItems: null,

	isLoadingData: computed('findAll.isRunning', 'searchTask.isRunning', function () {
		if (this.findAll.isRunning) {
			return true;
		} else if (this.searchTask.isRunning) {
			return true;
		} else {
			return false;
		}
	}),

	findAll: task(function* () {
		const { modelName, sortField } = this;
		const filteredItems = yield this.get('filteredItems');
		if (!filteredItems || !filteredItems.length > 0) {
			const items = yield this.store.query(modelName,
				{
					sort: sortField,
				});
			this.set('items', items);
		}
	}),

	init() {
		this._super(...arguments);
		this.findAll.perform();
	},

	searchTask: task(function* (searchValue) {
		yield timeout(300);
		const { searchField, sortField, modelName, includeField } = this;
		let filter = {};

		filter[searchField] = searchValue;
		return this.store.query(modelName, {
			filter: filter,
			sort: sortField,
			include: includeField || ''
		});
	}),

	actions: {
		selectModel(items) {
			this.selectModel(items);
		},

		resetValueIfEmpty(param) {
			if (param == "") {
				this.findAll.perform();
			}
		}
	},
});
