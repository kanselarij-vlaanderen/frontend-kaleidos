import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';

export default class AgendaItemsSearchController extends Controller {
  queryParams = {
    types: { type: 'array' },
    page: { type: 'number' },
    size: { type: 'number' },
    sort: { type: 'string' }
  };

  sizeOptions = Object.freeze([5, 10, 20, 50, 100, 200]);

  @tracked page;
  @tracked size;
  @tracked sort;
  @tracked types;

  @tracked emptySearch;

  constructor () {
    super(...arguments);
    this.page = 0;
    this.size = this.sizeOptions[2];
    this.decisionsOnly = false;
    this.types = A(['nota', 'mededeling']);
  }

  get includeNotas () {
    return this.types.includes('nota');
  }

  set includeNotas (value) {
    if (value === true) {
      if (!this.types.includes('nota')) {
        this.types.addObject('nota');
      }
    } else {
      this.types.removeObject('nota');
    }
    return value;
  }

  get includeMededelingen () {
    return this.types.includes('mededeling');
  }

  set includeMededelingen (value) {
    if (value === true) {
      if (!this.types.includes('mededeling')) {
        this.types.addObject('mededeling');
      }
    } else {
      this.types.removeObject('mededeling');
    }
    return value;
  }

  @action
  selectSize (size) {
    this.size = size;
  }

  @action
  toggleIncludeNotas () {
    this.toggleProperty('includeNotas')
  }

  @action
  toggleIncludeMededelingen () {
    this.toggleProperty('includeMededelingen')
  }

  @action
  navigateToAgendaitem (searchEntry) {
    if (searchEntry.meetingId) {
      this.transitionToRoute('agenda.agendaitems.agendaitem',
        searchEntry.meetingId, searchEntry.agendaId, searchEntry.id);
    } else {
      warn(`Agendaitem ${searchEntry.id} is not related to a meeting. Cannot navigate to detail`, { id: 'agendaitem.no-meeting' });
    }
  }
}
