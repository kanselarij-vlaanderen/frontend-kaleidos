import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';
import { warn } from '@ember/debug';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { PAGINATION_SIZES } from 'frontend-kaleidos/config/config';
import { addObject, removeObject } from 'frontend-kaleidos/utils/array-helpers';

export default class AgendaitemsSearchController extends Controller {
  @service router;
  @service intl;
  @service plausible;

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

  sortOptions = [
    { value: '-session-dates', label: this.intl.t('meeting-date') },
    { value: '', label: this.intl.t('relevance-score') }, // empty string as value because null is not handled correctly by select-element
  ];

  @tracked page;
  @tracked size;
  @tracked sort;
  @tracked types;
  @tracked latestOnly; // Only show the most recent version of an agenda-item
  @tracked searchText;

  constructor() {
    super(...arguments);
    this.page = 0;
    this.size = PAGINATION_SIZES[2];
    this.sort = this.sortOptions[1].value;
    this.types = A(['nota', 'mededeling']);
    this.latestOnly = true;
  }

  get emptySearch() {
    return isEmpty(this.searchText);
  }

  get includeNotas() {
    return this.types.includes('nota');
  }

  set includeNotas(value) {
    if (value === true) {
      addObject(this.type, 'nota');
    } else {
      removeObject(this.types, 'nota');
    }
  }

  get includeMededelingen() {
    return this.types.includes('mededeling');
  }

  set includeMededelingen(value) {
    if (value === true) {
      addObject(this.types, 'mededeling');
    } else {
      removeObject(this.types, 'mededeling');
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
  resultClicked(searchEntry, clickEvent) {
    this.plausible.trackEventWithRole('Zoekresultaat klik', { Pagina: this.page + 1 });
    this.navigateToAgendaitem(searchEntry, clickEvent);
  }

  @action
  navigateToAgendaitem(searchEntry, clickEvent) {
    if (searchEntry.meetingId) {
      // Check if we clicked an emphasis inside a linkTo or a linkTo
      if (clickEvent?.target.parentElement.className.indexOf('card-link') > -1 || clickEvent?.target.className.indexOf('card-link') > -1) {
        // do nothing, this was a clicked link in the card and the router will transition later
        return;
      } else {
        this.router.transitionTo(
          'agenda.agendaitems.agendaitem',
          searchEntry.meetingId,
          searchEntry.agendaId,
          searchEntry.id
        );
      }
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
