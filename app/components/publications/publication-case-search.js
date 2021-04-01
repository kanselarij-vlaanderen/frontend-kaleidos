import Component from '@glimmer/component';
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';
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
    if (!isEmpty(this.searchText)) {
      yield timeout(500);
      yield this.search.perform();
    } else {
      this.searchResults = [];
      this.hideResults();
    }
  }

  get resultListId() {
    return `${guidFor(this)}-results-list`;
  }

  get resultListDomElement() {
    return document.getElementById(this.resultListId);
  }

  @action
  showResults() {
    this.isShowingResults = true;
  }

  @action
  hideResults(event) {
    // only hide when focusout was triggered clicking *outside* the result list
    if (!this.resultListDomElement.contains(event.relatedTarget)) {
      this.isShowingResults = false;
    }
  }

  @restartableTask
  *search() {
    if (!isEmpty(this.searchText)) {
      this.searchResults = yield this.searchPublications.perform(this.searchText);
      this.showResults();
    } else {
      this.searchResults = [];
      this.hideResults();
    }
  }

  @restartableTask
  *searchPublications(searchTerm) {
    const filter = {
      ':has:publicationFlowNumber': 'true',
    };
    filter[`${this.searchModifier}${this.searchFields.join(',')}`] = searchTerm;
    const searchResults = yield search('cases', 0, 10, null, filter, (item) => {
      const entry = item.attributes;
      entry.id = item.id;
      return entry;
    });
    return searchResults;
  }
}
