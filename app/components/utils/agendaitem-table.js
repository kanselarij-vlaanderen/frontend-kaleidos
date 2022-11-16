/* eslint-disable class-methods-use-this */
// TODO: octane-refactor
/* eslint-disable ember/no-get, ember/classic-decorator-no-classic-methods */
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
/* eslint-disable ember/no-computed-properties-in-native-classes */
import {
  action, computed
} from '@ember/object';
import { oneWay } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { dasherize } from '@ember/string';
import Table from 'ember-light-table';
import { timeout, restartableTask } from 'ember-concurrency';

// TODO: octane-refactor
// eslint-disable-next-line ember/require-tagless-components
export default class AgendaitemTable extends Component {
  @service store;

  classNames = ['container-flex'];

  modelName = 'agendaitem';

  isScrolling = false;

  dir = 'asc';

  @oneWay('fetchRecords.isRunning') isLoading;

  canLoadMore = true;

  enableSync = true;

  include = null;

  row = null;

  meta = null;

  size = 10;

  page = 0;

  previousFilter = null;

  @computed('dir', 'sort')
  get sortBy() {
    const {
      dir,
    } = this;
    if (dir === 'asc') {
      return this.sort;
    }
    return `-${this.sort}`;
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
        page: 0,
      });
      this.get('model').clear();
      this.get('table').setRowsSynced([]);
      this.get('fetchRecords').perform();
    }
  }

  @computed('columns', 'enableSync', 'model.[]', 'sort')
  get table() {
    const table = Table.create({
      columns: this.columns,
      rows: [],
      enableSync: this.enableSync,
    });

    // Depending on where this component is used, conditional filtering on "isApproval"
    // shouldn't happen. We dó want to show the approval item in decision overview.
    // This component is very out of shape however. Take above in to account when rewriting.
    table.addRows(this.model.filter((agendaitem) => !agendaitem.isApproval));
    const sortColumn = table
      .get('allColumns')
      .findBy('valuePath', this.get('sort'));

    if (sortColumn) {
      sortColumn.set('sorted', true);
    }

    this.setRowsNotApproved(table.rows, this.model);
    return table;
  }

  /**
   * Will set the greyed classes on all actual table rows that have postponed or retracted decisions
   * It does so based on the current model and table rows that you supply
   * @param {Table} tableRows       Table object containing rows
   * @param {EmberArray} model      Model from the route currently active used as a lookup
   */
  setRowsNotApproved(tableRows, model) {
    const rowsCurrentlyInTable = tableRows;
    // relations are included in route
    const postponedItems = model.filter((agendaitem) => agendaitem.get('treatment.decisionActivity.isPostponed'));
    const retractedItems = model.filter((agendaitem) => agendaitem.get('treatment.decisionActivity.isRetracted'));
    const combinedItems = [...postponedItems, ...retractedItems];
    combinedItems.forEach((combinedItem) => {
      const rowInTable = rowsCurrentlyInTable.find(
        (rowFromTable) => rowFromTable.content.get('id') === combinedItem.get('id')
      );
      if (rowInTable) {
        rowInTable.set('classNames', 'auk-u-opacity--1/2');
      }
    });
  }

  @restartableTask
  fetchRecords = function *() {
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
      page: {
        number: this.page, size: this.size,
      },
      include: this.include,
    };
    if (!this.filter) {
      delete queryOptions.filter;
    }
    const records = yield this.store.query(
      `${this.modelName}`,
      queryOptions
    );

    this.get('model').pushObjects(records.toArray().filter((agendaitem) => !agendaitem.isApproval));
    this.set('meta', records.get('meta'));
    this.set('canLoadMore', records.get('meta.count') > this.get('model.length'));
    this.get('table').addRows(this.get('model').filter((agendaitem) => !agendaitem.isApproval));
  };
}
