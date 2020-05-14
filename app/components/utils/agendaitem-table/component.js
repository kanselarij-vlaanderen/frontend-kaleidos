import Component from '@ember/component';
import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { dasherize } from '@ember/string';
import Table from 'ember-light-table';
import { restartableTask } from 'ember-concurrency-decorators';
import { timeout } from 'ember-concurrency';

export default class AgendaitemTable extends Component {
  store = service();
  classNames = ['container-flex'];
  modelName = 'agendaitem';
  isScrolling = false;
  dir = 'asc';
  isLoading = computed.oneWay('fetchRecords.isRunning');
  canLoadMore = true;
  enableSync = true;
  include = null;
  row = null;
  meta = null;
  table = null;
  size = 10;
  previousFilter = null;

  constructor() {
    super(...arguments);
    this.initialiseTableBasedOnModel();
  }

  @computed('dir', 'sort')
  sortBy() {
    const dir = this.dir;
    if (dir === 'asc') {
      return this.sort;
    } else {
      return `-${this.sort}`;
    }
  }

  @restartableTask
  fetchRecords = function* () {
    yield timeout(500);
    if (this.previousFilter !== this.filter) {
      this.set('previousFilter', this.filter);
      this.set('model', []);
      this.get('table').setRows([]);
      this.set('page', 0);
    }
    const queryOptions = {
      filter: this.filter,
      sort: this.get('sortBy'),
      page: { number: this.page, size: this.size },
      include: this.include
    };
    if (!this.filter) {
      delete queryOptions.filter;
    }
    let records = yield this.get('store').query(
      `${this.modelName}`,
      queryOptions
    );

    this.get('model').pushObjects(records.toArray().filter((item) => !item.isApproval));
    this.set('meta', records.get('meta'));
    this.set('canLoadMore', records.get('meta.count') > this.get('model.length'));
    this.get('table').addRows(this.get('model').filter((item) => !item.isApproval));
    this.checkRowClasses();
  }

  @restartableTask
  setRows = function* (rows) {
    this.get('table').setRowsSynced([]);
    yield timeout(100); // Allows isLoading state to be shown
    this.get('table').setRowsSynced(rows);
  }

  checkRowClasses() {
    const rows = this.table.rows;
    const postponedItems = this.model.filter(item => item.get('retracted'));
    postponedItems.map(postponedItem => {
      const myRow = rows.find(
        row => row.content.get('id') === postponedItem.get('id')
      );
      if (myRow) {
        myRow.set('classNames', 'postponed');
      }
    });
  }

  initialiseTableBasedOnModel() {
    this.set("page", 0);
    let table = Table.create({
      columns: this.get("columns"),
      rows: [],
      enableSync: this.get("enableSync")
    });
    table.addRows(this.get('model').filter((item) => !item.isApproval));
    let sortColumn = table
      .get('allColumns')
      .findBy('valuePath', this.get('sort'));
    if (sortColumn) {
      sortColumn.set('sorted', true);
    }
    this.set('table', table);
    this.checkRowClasses();
  }

  @action
  onScrolledToBottom() {
    if (this.get('canLoadMore')) {
      if (!this.isLoading) {
        this.incrementProperty('page');
        this.get('fetchRecords').perform();
      }
    }
  }

  @action
  onColumnClick(column) {
    if (column.sorted) {
      this.setProperties({
        dir: column.ascending ? 'asc' : 'desc',
        sort: dasherize(column.get('valuePath')),
        canLoadMore: true,
        page: 0
      });
      this.get('model').clear();
      this.get('setRows').perform([]);
      this.get('fetchRecords').perform();
    }
  }
}
