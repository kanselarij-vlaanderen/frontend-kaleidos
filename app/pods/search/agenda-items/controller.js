import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';
import { warn } from '@ember/debug';

export default class AgendaitemsSearchController extends Controller {
  queryParams = {
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
  };

  sizeOptions = Object.freeze([5, 10, 20, 50, 100, 200]);

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
    this.sort = '-session-dates';
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
  toggleIncludeNotas() {
    this.toggleProperty('includeNotas');
  }

  @action
  toggleIncludeMededelingen() {
    this.toggleProperty('includeMededelingen');
  }

  @action
  toggleLatestOnly() {
    this.toggleProperty('latestOnly');
  }

  @action
  navigateToAgendaitem(searchEntry) {
    if (searchEntry.meetingId) {
      this.transitionToRoute('agenda.agendaitems.agendaitem',
        searchEntry.meetingId, searchEntry.agendaId, searchEntry.id);
    } else {
      warn(`Agendaitem ${searchEntry.id} is not related to a meeting. Cannot navigate to detail`, {
        id: 'agendaitem.no-meeting',
      });
    }
  }
}
