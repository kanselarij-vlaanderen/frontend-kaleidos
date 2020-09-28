import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import {
  task,
  timeout
} from 'ember-concurrency';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class AddExistingDocument extends Component {
  @service store;
  @tracked page = 0;
  @tracked filter = '';
  @tracked documents = [];

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
    this.documents.map((document) => document.set('selected', false));
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
    this.documents = yield this.store.query('document-version', this.queryOptions());
    yield timeout(100);
    this.setSelectedToFalse();
  })findAll;

  @task(function *() {
    yield timeout(300);
    this.documents = yield this.store.query('document-version', this.queryOptions());
    this.page = 0;
    yield timeout(100);
  })searchTask;

  @action
  async select(document, event) {
    if (event) {
      event.stopPropagation();
    }
    if (document.selected) {
      document.set('selected', false);
      this.args.delete(document);
    } else {
      document.set('selected', true);
      this.args.add(document);
    }
  }
}
