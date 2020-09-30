import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import {
  task,
  timeout
} from 'ember-concurrency';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class AddExistingPiece extends Component {
  @service store;
  @tracked page = 0;
  @tracked filter = '';
  @tracked pieces = [];

  size = 5;
  sort = ['-created', 'name'];

  constructor() {
    super(...arguments);
    this.findAll.perform();
  }

  get pageParam() {
    return this.page;
  }

  set pageParam(page) {
    if (page === undefined) {
      this.page = 0;
    } else {
      this.page = page;
    }
    this.findAll.perform();
  }

  setSelectedToFalse() {
    this.pieces.map((piece) => piece.set('selected', false));
  }

  queryOptions() {
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

  @task(function *() {
    yield timeout(300);
    this.pieces = yield this.store.query('piece', this.queryOptions());
    yield timeout(100);
    this.setSelectedToFalse();
  })findAll;

  @task(function *() {
    yield timeout(300);
    this.pieces = yield this.store.query('piece', this.queryOptions());
    this.page = 0;
    yield timeout(100);
  })searchTask;

  @action
  async select(piece, event) {
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
}
