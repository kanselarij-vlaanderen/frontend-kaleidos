import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import {
  task,
  timeout,
  restartableTask,
} from 'ember-concurrency';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { PAGINATION_SIZES } from 'frontend-kaleidos/config/config';

/**
 * @param onLink {Function} Action executed when a piece is selected
 * @param onUnlink {Function} Action executed when a piece is deselected
 */
export default class AddExistingPiece extends Component {
  @service store;

  @tracked page = 0;
  @tracked size = PAGINATION_SIZES[1];
  @tracked filter = '';

  @tracked pieces = [];
  @tracked selected = [];

  sort = ['-created', 'name'];

  constructor() {
    super(...arguments);
    this.findAll.perform();
  }

  get queryOptions() {
    const options = {
      sort: this.sort,
      page: {
        number: this.page,
        size: this.size,
      },
      filter: {},
    };
    if (this.filter) {
      options.filter.name = this.filter;
    }
    return options;
  }

  @task
  *findAll() {
    yield timeout(300);
    this.pieces = yield this.store.query('piece', this.queryOptions);
    yield timeout(100);
    this.selected = [];
  }

  @restartableTask
  *searchTask() {
    yield timeout(300);
    this.pieces = yield this.store.query('piece', this.queryOptions);
    this.page = 0;
    yield timeout(100);
  }

  @action
  select(piece) {
    const index = this.selected.indexOf(piece);
    const isSelected = index > -1;

    if (isSelected) {
      this.selected = [...this.selected.slice(0, index), ...this.selected.slice(index + 1)];
      this.args.onUnlink(piece);
    } else {
      this.selected = [...this.selected, piece];
      this.args.onLink(piece);
    }
  }

  @action
  setPage(page) {
    this.page = page;
    this.findAll.perform();
  }

  @action
  setSize(size) {
    this.size = size;
    this.findAll.perform();
  }

  @action
  preventClick(event) {
    event.preventDefault();
    event.stopPropagation();
  }
}
