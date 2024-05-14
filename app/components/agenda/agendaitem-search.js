import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { dropTask, restartableTask, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';

export default class AgendaItemSearch extends Component {
  @service currentSession;

  @tracked searchText;

  constructor() {
    super(...arguments);
    this.searchText = this.args.searchText || '';
  }

  get canEdit() {
    return this.currentSession.may('manage-agendaitems') &&
      this.args.currentAgenda.status.get('isDesignAgenda') &&
      isEmpty(this.searchText);
  }

  @action
  onInputSearchText(event) {
    this.searchText = event.target.value;
    this.debouncedSearch.perform();
  }

  @action
  onEnterKeySearchText(event) {
    if (event.key === 'Enter') {
      this.searchText = event.target.value;
      this.search.perform();
    }
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
