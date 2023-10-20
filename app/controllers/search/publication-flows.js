import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { PAGINATION_SIZES } from 'frontend-kaleidos/config/config';

export default class SearchPublicationFlowsController extends Controller {
  @service router;
  @service intl;
  @service plausible;

  queryParams = [
    {
      statuses: {
        type: 'array',
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
    { value: '-session-date', label: this.intl.t('meeting-date') },
    { value: '', label: this.intl.t('relevance-score') }, // empty string as value because null is not handled correctly by select-element
  ];

  @tracked page = 0;
  @tracked size = PAGINATION_SIZES[2];
  @tracked sort = this.sortOptions[1].value;
  @tracked statuses = [];
  @tracked searchText;

  constructor() {
    super(...arguments);
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
  setStatuses(statuses) {
    this.statuses = statuses;
  }

  @action
  navigateToCase(publicationFlow, clickEvent) {
    const decisionmakingFlowId = publicationFlow.decisionmakingFlowId;
    // Check if we clicked an emphasis inside a linkTo or a linkTo
    if (!decisionmakingFlowId || clickEvent?.target.parentElement.className.indexOf('card-link') > -1 || clickEvent?.target.className.indexOf('card-link') > -1) {
      // do nothing, there is no ID to navigate to or this was a clicked link in the card and the router will transition later
      return;
    } else {
      this.router.transitionTo('cases.case.subcases', decisionmakingFlowId);
    }
  }

  get customFiltersElement() {
    return document.getElementById('search-subroute-filters-area');
  }
}
