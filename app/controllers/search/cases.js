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

  @tracked page = 0;
  @tracked size = PAGINATION_SIZES[2];
  @tracked sort = this.sortOptions[1].value;
  @tracked archived = this.archivedOptions[0].value;
  @tracked confidentialOnly = false;
  @tracked searchText;

  constructor() {
    super(...arguments);
  }

  get emptySearch() {
    return isEmpty(this.searchText);
  }
  get selectedArchivedOption() {
    return this.archived;
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
  onChangeArchivedOption(selectedArchivedOption) {
    this.archived = selectedArchivedOption;
  }

  @action
  resultClicked(searchEntry, clickEvent) {
    this.plausible.trackEventWithRole('Zoekresultaat klik', { Pagina: this.page + 1 });
    this.navigateToCase(searchEntry, clickEvent);
  }

  @action
  navigateToCase(decisionmakingFlow, clickEvent) {
    // Check if we clicked an emphasis inside a linkTo or a linkTo
    if (clickEvent?.target.parentElement.className.indexOf('card-link') > -1 || clickEvent?.target.className.indexOf('card-link') > -1) {
      // do nothing, this was a clicked link in the card and the router will transition later
      return;
    } else {
      this.router.transitionTo('cases.case.subcases', decisionmakingFlow.id);
    }
  }

  get customFiltersElement() {
    return document.getElementById('search-subroute-filters-area');
  }
}
