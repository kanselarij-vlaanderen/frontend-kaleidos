import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { inject as service } from '@ember/service';
import Table from 'ember-light-table';
import { task, timeout } from 'ember-concurrency';

export default Mixin.create({
	store: service(),
	modelName: null,
	dir: 'asc',
	isLoading: computed.oneWay('fetchRecords.isRunning'),
	canLoadMore: true,
	enableSync: true,
	include: null,

	meta: null,
	table: null,

	init() {
		this._super(...arguments);
		this.set('page', 0);
		let table = new Table(this.get('columns'), [], { enableSync: this.get('enableSync') });
		table.addRows(this.get('model'))
		let sortColumn = table.get('allColumns').findBy('valuePath', this.get('sort'));

		// Setup initial sort column
		if (sortColumn) {
			sortColumn.set('sorted', true);
		}

		this.set('table', table);
		this.checkRowClasses();
	},

	fetchRecords: task(function* () {
		const queryOptions = {
			filter: this.filter,
			sort: this.sortBy,
			page: { number: this.page, size: 10 },
			include: this.include
		}
		let records = yield this.get('store').query(`${this.modelName}`, queryOptions);

		this.get('model').pushObjects(records.toArray());
		this.set('meta', records.get('meta'));
		this.set('canLoadMore', !isEmpty(records));
		this.get('table').addRows(this.get('model'));
		this.checkRowClasses();
	}),

	checkRowClasses() {
		const rows = this.table.rows;
		const postponedItems = this.model.filter((item) => item.get('retracted'))
		postponedItems.map((postponedItem) => {
			const myRow = rows.find((row) => row.content.get('id') === postponedItem.get('id'));
			if (myRow) {
				myRow.set('classNames', "postponed")
			}
		})
	},

	sortBy: computed('dir', 'sort', function () {
		const dir = this.dir;
		if (dir === "asc") {
			return this.sort;
		} else {
			return `-${this.sort}`;
		}
	}).readOnly(),

	setRows: task(function* (rows) {
		this.get('table').setRowsSynced([]);
		yield timeout(100); // Allows isLoading state to be shown
		this.get('table').setRowsSynced(rows);
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
