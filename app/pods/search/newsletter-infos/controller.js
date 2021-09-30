import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { warn } from '@ember/debug';

export default class AgendaitemsSearchController extends Controller {
  queryParams = {
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
  @tracked emptySearch;

  constructor() {
    super(...arguments);
    this.page = 0;
    this.size = this.sizeOptions[2];
    this.sort = '-publicationDate';
  }

  @action
  selectSize(size) {
    this.size = size;
  }


  @action
  navigateToNewsletter(searchEntry) {
    if (searchEntry.meetingId) {
      this.transitionToRoute('agenda.agendaitems.agendaitem.news-item',
        searchEntry.meetingId, searchEntry.agendaId, searchEntry.agendaitemId);
    } else {
      warn(`Newsletter ${searchEntry.id} is not related to a meeting. Cannot navigate to detail`, {
        id: 'agendaitem.no-meeting',
      });
    }
  }
}
