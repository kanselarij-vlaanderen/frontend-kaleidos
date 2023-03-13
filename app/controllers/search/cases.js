import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { PAGINATION_SIZES } from 'frontend-kaleidos/config/config';

export default class CasesSearchController extends Controller {
  @service router;
  @service intl;
  @service plausible;

  queryParams = [
    {
      archived: {
        type: 'string',
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
  @tracked confidentialOnly;
  @tracked searchText;

  constructor() {
    super(...arguments);
    this.page = 0;
    this.size = PAGINATION_SIZES[2];
    this.sort = this.sortOptions[1].value;
    this.archived = this.archivedOptions[0].value;
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
    this.plausible.trackEventWithRole('Zoekresultaat klik', { Pagina: this.page + 1 });
    this.router.transitionTo('cases.case.subcases', decisionmakingFlow.id);
  }

  get customFiltersElement() {
    return document.getElementById('search-subroute-filters-area');
  }
}
