import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { warn } from '@ember/debug';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';

export default class SearchDecisionsController extends Controller {
  @service intl;
  @service router;

  queryParams = [
    {
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

  @tracked page;
  @tracked size;
  @tracked sort;
  @tracked searchText;

  constructor() {
    super(...arguments);
    this.page = 0;
    this.size = this.sizeOptions[2];
    this.sort = this.sortOptions[1].value;
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
  navigateToDecision(searchEntry) {
    if (searchEntry.meetingId) {
      this.router.transitionTo(
        'agenda.agendaitems.agendaitem.decisions',
        searchEntry.meetingId,
        searchEntry.agendaId,
        searchEntry.id
      );
    } else {
      warn(
        `Agendaitem ${searchEntry.id} is not related to a meeting. Cannot navigate to decisions`,
        {
          id: 'agendaitem.no-meeting',
        }
      );
    }
  }

  get customFiltersElement() {
    return document.getElementById('search-subroute-filters-area');
  }
}
