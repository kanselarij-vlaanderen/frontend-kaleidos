import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';

export default class CasesSearchController extends Controller {
  @service router;
  @service intl;

  queryParams = [
    {
      archived: {
        type: 'string',
      },
      decisionsOnly: {
        type: 'boolean',
      },
      confidentialOnly: {
        type: 'boolean',
      },
      page: {
        type: 'number',
      },
      size: {
        type: 'number',
      },
      sort: {
        type: 'string',
      },
    },
  ];

  sizeOptions = [5, 10, 20, 50, 100, 200];
  sortOptions = [
    { value: '-session-dates', label: this.intl.t('meeting-date') },
    { value: '', label: this.intl.t('relevance-score') }, // empty string as value because null is not handled correctly by select-element
  ];

  archivedOptions = [
    {
      label: this.intl.t('search-hide-archived'),
      value: 'hide',
    },
    {
      label: this.intl.t('show-archived'),
      value: 'show',
    },
    {
      label: this.intl.t('search-archived-only'),
      value: 'only',
    },
  ];

  @tracked page;
  @tracked size;
  @tracked sort;
  @tracked archived;
  @tracked decisionsOnly;
  @tracked confidentialOnly;
  @tracked searchText;

  constructor() {
    super(...arguments);
    this.page = 0;
    this.size = this.sizeOptions[2];
    this.sort = this.sortOptions[1].value;
    this.archived = this.archivedOptions[0];
    this.decisionsOnly = false;
    this.confidentialOnly = false;
  }

  get emptySearch() {
    return isEmpty(this.searchText);
  }

  @action
  selectSize(size) {
    this.size = size;
  }

  @action
  selectSort(event) {
    this.sort = event.target.value;
  }

  @action
  setArchived(option) {
    this.archived = option;
  }

  @action
  navigateToCase(decisionmakingFlow) {
    this.router.transitionTo('cases.case.subcases', decisionmakingFlow.id);
  }

  get customFiltersElement() {
    return document.getElementById('search-subroute-filters-area');
  }
}
