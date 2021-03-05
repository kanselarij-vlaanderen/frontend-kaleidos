import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { timeout } from 'ember-concurrency';
import { restartableTask } from 'ember-concurrency-decorators';
import search from 'frontend-kaleidos/utils/mu-search';

export default class PublicationsPublicationCaseSearchComponent extends Component {
  @tracked searchText;
  @tracked isShowingResults = false;
  @tracked searchResults;

  searchFields = Object.freeze([
    'title',
    'publicationFlowNumber',
    'publicationFlowRemark',
    'shortTitle',
    'subcaseTitle',
    'subcaseSubTitle',
    'publicationFlowNumacNumbers',
    'publicationFlowId'
  ]);
  searchModifier = Object.freeze(':phrase_prefix:');

  @restartableTask
  *debouncedSearch(event) {
    this.searchText = event.target.value;
    yield timeout(500);
    yield this.search.perform(this.searchText);
  }

  @action
  showResults() {
    this.isShowingResults = true;
  }

  @action
  hideResults() {
    console.log('In hide');
    this.isShowingResults = false;
  }

  @restartableTask
  *search() {
    const filter = {
      ':has:publicationFlowNumber': 'true',
    };
    filter[`${this.searchModifier}${this.searchFields.join(',')}`] = `${this.searchText}*`;
    this.searchResults = yield search('cases', 0, 10, null, filter, (item) => {
      const entry = item.attributes;
      entry.id = item.id;
      return entry;
    });
    this.showResults();
  }
}
