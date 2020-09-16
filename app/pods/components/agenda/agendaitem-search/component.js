import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import {
  task, timeout
} from 'ember-concurrency';

export default class AgendaItemSearch extends Component {
  @tracked searchText;

  constructor() {
    super(...arguments);
    this.searchText = this.args.searchText || '';
  }

  @(task(function *() {
    yield timeout(500);
    yield this.search(this.searchText);
  }).restartable()) debouncedSearchTask;

  @action
  debouncedSearch(event) {
    this.searchText = event.target.value;
    this.debouncedSearchTask.perform();
  }

  @action
  async search() {
    const handler = this.args.onSearch;
    if (handler) {
      await handler(this.searchText);
    }
  }
}
