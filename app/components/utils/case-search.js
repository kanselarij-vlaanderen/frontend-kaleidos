import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { debounce } from '@ember/runloop';
import search from 'frontend-kaleidos/utils/mu-search';
import { PAGINATION_SIZES } from 'frontend-kaleidos/config/config';

export default class CaseSearch extends Component {
  size = PAGINATION_SIZES[0];
  textSearchFields = null;

  @tracked results = null;
  @tracked isLoading = true;
  @tracked searchText = null;
  @tracked selected
  @tracked page = 0;

  constructor() {
    super(...arguments);

    this.textSearchFields = ['uuid', 'title', 'shortTitle', 'subcaseTitle', 'subcaseSubTitle'];
    this.performSearch();
  }

  debouncedSearch() {
    this.performSearch(this.searchText);
  }

  async performSearch(searchTerm) {
    this.isLoading = true;
    const searchModifier = ':sqs:';

    const textSearchKey = this.textSearchFields.join(',');

    const filter = {};
    if (!isEmpty(searchTerm)) {
      filter[`${searchModifier}${textSearchKey}`] = searchTerm;
    }

    if (Object.keys(filter).length === 0) {
      filter[':sqs:title'] = '*'; // search without filter
    }
    this.results = await search('decisionmaking-flows', this.page, this.size, null, filter, (item) => {
      const entry = item.attributes;
      entry.id = item.id;
      return entry;
    });
    this.isLoading = false;
  }

  @action
  updateSearchText(event) {
    this.page = 0;
    this.searchText = event.target.value;
    debounce(this, this.debouncedSearch, 500);
  }

  @action
  prevPage() {
    if (this.page > 0) {
      this.page = this.page - 1;
      this.performSearch(this.searchText);
      this.selected = null;
      this.args.onSelect?.(this.selected);
    }
  }

  @action
  nextPage() {
    this.page = this.page + 1;
    this.performSearch(this.searchText);
    this.selected = null;
    this.args.onSelect?.(this.selected);
  }

  @action
  selectCase(caseId, event) {
    if (event) {
      event.stopPropagation();
    }
    this.selected = this.results.find((_case) => _case.id === caseId);
    this.args.onSelect?.(this.selected);
  }
}
