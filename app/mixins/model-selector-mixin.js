import Mixin from '@ember/object/mixin';
import { inject } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import { computed } from '@ember/object';

export default Mixin.create({
	classNameBindings: ['classes'],
	store: inject(),
	modelName: null,
	searchField: null,
	propertyToShow: null,
	placeholder: null,
	sortField: null,
	filter: null,
	loadingMessage: "Even geduld aub..",
	noMatchesMessage: "Geen zoekresultaten gevonden",
	searchMessage: "Even geduld aub..",
	defaultSelected: null,
	selectedItems: null,

	class:computed('class', function() {
		return this.class;
	}),

	isLoadingData: computed('findAll.isRunning', 'searchTask.isRunning', function () {
		if (this.findAll.isRunning) {
			return true;
		} else if (this.searchTask.isRunning) {
			return true;
		} else {
			return false;
		}
	}),

	queryOptions: computed('sortField', 'filter', 'modelName', 'includeField', function () {
		let options = {};
		const { filter, sortField, includeField } = this;
		if (sortField) {
			options['sort'] = sortField;
		}
		if (filter) {
			options['filter'] = filter;
		}
		if (includeField) {
			options['include'] = includeField;
		}
		return options;
	}),

	findAll: task(function* () {
		const { modelName, queryOptions } = this;
		const filteredItems = yield this.get('filteredItems');
		if (!filteredItems || !filteredItems.length > 0) {
			const items = yield this.store.query(modelName, queryOptions);
			this.set('items', items);
		}
	}),

	init() {
		this._super(...arguments);
		this.findAll.perform();
	},

	searchTask: task(function* (searchValue) {
		yield timeout(300);
		const { queryOptions, searchField, modelName } = this;

		queryOptions['filter'][searchField] = searchValue;
		return this.store.query(modelName, queryOptions);
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
