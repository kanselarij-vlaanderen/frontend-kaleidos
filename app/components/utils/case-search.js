import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { debounce } from '@ember/runloop';
import search from 'frontend-kaleidos/utils/mu-search';

export default class CaseSearch extends Component {
  size = 5;
  textSearchFields = null;

  @tracked results = null;
  @tracked isLoading = false;
  @tracked searchText = null;
  @tracked page = 0;

  constructor() {
    super(...arguments);

    this.textSearchFields = ['title', 'shortTitle', 'subcaseTitle', 'subcaseSubTitle'];
    this.performSearch();
  }

  debouncedSearch() {
    this.performSearch(this.searchText);
  }

  async performSearch(searchTerm) {
    this.loading = true;
    const searchModifier = ':sqs:';

    const textSearchKey = this.textSearchFields.join(',');

    const filter = {};
    if (!isEmpty(searchTerm)) {
      filter[`${searchModifier}${textSearchKey}`] = searchTerm;
    }

    if (Object.keys(filter).length === 0) {
      filter[':sqs:title'] = '*'; // search without filter
    }

    this.results = await search('cases', this.page, this.size, null, filter, (item) => {
      const entry = item.attributes;
      entry.id = item.id;
      return entry;
    });
    this.isLoading = false;
  }

  @action
  updateSearchText(text) {
    this.searchText = text.target.value;
    debounce(this, this.debouncedSearch, 500);
  }

  @action
  prevPage() {
    if (this.page > 0) {
      this.page = this.page - 1;
      this.performSearch(this.searchText);
    }
  }

  @action
  nextPage() {
    this.page = this.page + 1;
    this.performSearch(this.searchText);
  }

  @action
  async selectCase(caseItem, event) {
    // We never set loading to false, because the component closes after this action
    this.isLoading = true;
    if (event) {
      event.stopPropagation();
    }

    this.args.onSelect(caseItem);
  }
}
