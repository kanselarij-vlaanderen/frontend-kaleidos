import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { dropTask, restartableTask, timeout } from 'ember-concurrency';

export default class AgendaItemSearch extends Component {
  @tracked searchText;

  constructor() {
    super(...arguments);
    this.searchText = this.args.searchText || '';
  }

  @restartableTask
  *debouncedSearch() {
    yield timeout(500);
    yield this.search.perform();
  }

  @dropTask
  *search() {
    if (this.args.onSearch) {
      yield this.args.onSearch(this.searchText);
    }
  }
}
