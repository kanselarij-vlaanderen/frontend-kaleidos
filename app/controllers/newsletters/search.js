import Controller from '@ember/controller';
import moment from 'moment';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class NewsletterInfosSearchController extends Controller {
  @service router;
  @service currentSession;

  queryParams = {
    searchText: {
      type: 'string',
    },
    mandatees: {
      type: 'string',
    },
    dateFrom: {
      type: 'string',
    },
    dateTo: {
      type: 'string',
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

  @tracked searchText = '';
  @tracked mandatees;
  @tracked dateFrom;
  @tracked dateTo;
  @tracked searchTextBuffer = '';
  @tracked mandateesBuffer;
  @tracked dateFromBuffer;
  @tracked dateToBuffer;
  @tracked page;
  @tracked size;
  @tracked sort;
  @tracked emptySearch;
  @tracked isLoadingModel;

  constructor() {
    super(...arguments);
    this.page = 0;
    this.size = this.sizeOptions[2];
    this.sort = '-agendaitems.meetingDate';
  }

  deserializeDate(date) {
    return date && moment(date, 'DD-MM-YYYY').toDate();
  }

  serializeDate(date) {
    return date && moment(date).format('DD-MM-YYYY');
  }

  @action
  search(e) {
    e.preventDefault();
    this.searchText = this.searchTextBuffer;
    this.mandatees = this.mandateesBuffer;
    this.dateFrom = this.serializeDate(this.dateFromBuffer);
    this.dateTo = this.serializeDate(this.dateToBuffer);
  }

  @action
  selectSize(size) {
    this.size = size;
  }

  @action
  navigateToNewsletter(searchEntry) {
    const latestAgendaitem = searchEntry.latestAgendaitem;
    if (latestAgendaitem) {
      this.router.transitionTo(
        'agenda.agendaitems.agendaitem.news-item',
        latestAgendaitem['meetingId'],
        latestAgendaitem['agendaId'],
        latestAgendaitem['id']
      );
    }
  }
}
