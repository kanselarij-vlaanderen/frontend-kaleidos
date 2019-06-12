import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { inject as service } from '@ember/service';
import Table from 'ember-light-table';
import { task, timeout } from 'ember-concurrency';

export default Mixin.create({
	store: service(),

	page: 0,
	limit: 10,
	dir: '',

	isLoading: computed.oneWay('fetchRecords.isRunning'),
	canLoadMore: true,
	enableSync: false,

	model: null,
	meta: null,
	table: null,

	init() {
		this._super(...arguments);
		let table = new Table(this.get('columns'), this.get('model'), { enableSync: this.get('enableSync') });
		let sortColumn = table.get('allColumns').findBy('valuePath', this.get('sort'));

		// Setup initial sort column
		if (sortColumn) {
			sortColumn.set('sorted', true);
		}

		this.set('table', table);
	},

	fetchRecords: task(function* () {
		let records = yield this.get('store').query('agendaitem', {
			filter: this.get('filter'),
			sort: this.sortBy,
			page: { number: this.page, size: this.limit }
		});

		this.get('model').pushObjects(records.toArray());
		this.set('meta', records.get('meta'));
		this.set('canLoadMore', !isEmpty(records));
		this.get('table').addRows(this.get('model'));

	}).restartable(),

	sortBy: computed('dir', 'sort', function () {
		const dir = this.dir;
		if (dir === "asc") {
			return this.sort;
		} else {
			return `-${this.sort}`;
		}
	}).readOnly(),

	setRows: task(function* (rows) {
		this.get('table').setRows([]);
		yield timeout(100); // Allows isLoading state to be shown
		this.get('table').setRows(rows);
	}).restartable(),

	actions: {
		onScrolledToBottom() {
			if (this.get('canLoadMore')) {
				if (!this.isLoading) {
					this.incrementProperty('page');
					this.get('fetchRecords').perform();
				}
			}
		},

		onColumnClick(column) {
			if (column.sorted) {
				this.setProperties({
					dir: column.ascending ? 'asc' : 'desc',
					sort: column.get('valuePath'),
					canLoadMore: true,
					page: 0
				});
				this.get('model').clear();
				this.get('setRows').perform([]);
				this.get('fetchRecords').perform();
			}
		}
	}
});
