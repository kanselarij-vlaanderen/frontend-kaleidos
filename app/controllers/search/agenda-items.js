import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';
import { warn } from '@ember/debug';
import { inject as service } from '@ember/service';

export default class AgendaitemsSearchController extends Controller {
  @service router;
  @service intl;

  queryParams = [
    {
      types: {
        type: 'array',
      },
      latestOnly: {
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

  @tracked page;
  @tracked size;
  @tracked sort;
  @tracked types;
  @tracked latestOnly; // Only show the most recent version of an agenda-item
  @tracked emptySearch;

  constructor() {
    super(...arguments);
    this.page = 0;
    this.size = this.sizeOptions[2];
    this.sort = this.sortOptions[0].value;
    this.types = A(['nota', 'mededeling']);
    this.latestOnly = true;
  }

  get includeNotas() {
    return this.types.includes('nota');
  }

  set includeNotas(value) {
    if (value === true) {
      if (!this.types.includes('nota')) {
        this.types.addObject('nota');
      }
    } else {
      this.types.removeObject('nota');
    }
  }

  get includeMededelingen() {
    return this.types.includes('mededeling');
  }

  set includeMededelingen(value) {
    if (value === true) {
      if (!this.types.includes('mededeling')) {
        this.types.addObject('mededeling');
      }
    } else {
      this.types.removeObject('mededeling');
    }
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
  toggleIncludeNotas() {
    this.includeNotas = !this.includeNotas;
  }

  @action
  toggleIncludeMededelingen() {
    this.includeMededelingen = !this.includeMededelingen;
  }

  @action
  toggleLatestOnly() {
    this.latestOnly = !this.latestOnly;
  }

  @action
  navigateToAgendaitem(searchEntry) {
    if (searchEntry.meetingId) {
      this.router.transitionTo(
        'agenda.agendaitems.agendaitem',
        searchEntry.meetingId,
        searchEntry.agendaId,
        searchEntry.id
      );
    } else {
      warn(
        `Agendaitem ${searchEntry.id} is not related to a meeting. Cannot navigate to detail`,
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
