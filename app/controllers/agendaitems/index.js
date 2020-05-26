import { computed } from '@ember/object';
import Controller from '@ember/controller';
import { warn } from '@ember/debug';
import moment from 'moment';

export default Controller.extend({
  sizeOptions: Object.freeze([5, 10, 20, 50, 100, 200]),
  size: 10,
  page: 0,
  sort: '-session-dates', // By default sort from newest to oldest

  deSerializedDateFrom: computed('dateFrom', {
    get() {
      return this.dateFrom && moment(this.dateFrom, "DD-MM-YYYY").toDate();
    },
    set(key, value) {
      this.set('dateFrom', value && moment(value).format('DD-MM-YYYY'));
      return value;
    }
  }),

  deSerializedDateTo: computed('dateTo', {
    get() {
      return this.dateTo && moment(this.dateTo, "DD-MM-YYYY").toDate();
    },
    set(key, value) {
      this.set('dateTo', value && moment(value).format('DD-MM-YYYY'));
      return value;
    }
  }),

  actions: {
    selectSize(size) {
      this.set('size', size);
    },
    filterAgendaitems(filter) {
      this.set('page', 0);
      this.set('searchText', filter.searchText);
      this.set('mandatees', filter.mandatees);
      this.set('deSerializedDateFrom', filter.dateFrom);
      this.set('deSerializedDateTo', filter.dateTo);
      this.set('announcementsOnly', filter.announcementsOnly);
    },
    navigateToAgendaitem(searchEntry) {
      if (searchEntry.meetingId) {
        this.transitionToRoute('agenda.agendaitems.agendaitem',
          searchEntry.meetingId, searchEntry.agendaId, searchEntry.id);
      } else {
        warn(`Agendaitem ${searchEntry.id} is not related to a meeting. Cannot navigate to detail`, { id: 'agendaitem.no-meeting' });
      }
    }
  }
});
