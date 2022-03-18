import Component from '@glimmer/component';
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { timeout } from 'ember-concurrency';
import { restartableTask } from 'ember-concurrency-decorators';

export default class AgendaAgendaOverviewAgendaSearchComponent extends Component {
  @tracked searchText = "";
  @tracked isShowingResults = false;
  @tracked searchResults;

  searchFields = Object.freeze([
    'title',
    'shortTitle',
    'remark',
    'identification',
    'numacNumbers'
  ]);
  searchModifier = Object.freeze(':phrase_prefix:');

  @restartableTask
  *debouncedSearch(event) {
    this.searchText = event.target.value;
    if (!isEmpty(this.searchText)) {
      yield timeout(500);
    } else {
      this.searchResults = [];
    }
  }

  get resultListId() {
  }

  get resultListDomElement() {
  }

  @action
  resetFilter() {
    this.searchText = "";
  }

  @action
  showResults() {
  }

  @action
  hideResults(event) {

  }

  @restartableTask
  *search() {

  }

  @restartableTask
  *searchPublications(searchTerm) {

  }
}
