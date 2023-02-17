import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import {
  task,
  timeout,
  restartableTask,
} from 'ember-concurrency';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class AddExistingPiece extends Component {
  @service store;

  @tracked page = 0;
  @tracked size = 10;
  @tracked filter = '';

  @tracked pieces = [];

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
    this.setSelectedToFalse();
  }

  @restartableTask
  *searchTask() {
    yield timeout(300);
    this.pieces = yield this.store.query('piece', this.queryOptions);
    this.page = 0;
    yield timeout(100);
  }

  @action
  async select(piece, _checked, event) {
    if (event) {
      event.stopPropagation();
    }
    if (piece.selected) {
      piece.set('selected', false);
      this.args.delete(piece);
    } else {
      piece.set('selected', true);
      this.args.add(piece);
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
}
