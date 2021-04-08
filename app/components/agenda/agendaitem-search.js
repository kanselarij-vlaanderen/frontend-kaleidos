import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { timeout } from 'ember-concurrency';
import { restartableTask } from 'ember-concurrency-decorators';

export default class AgendaItemSearch extends Component {
  @tracked searchText;

  constructor() {
    super(...arguments);
    this.searchText = this.args.searchText || '';
  }

  @restartableTask
  *debouncedSearchTask() {
    yield timeout(500);
    yield this.search();
  }

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
