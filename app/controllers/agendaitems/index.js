import Controller from '@ember/controller';
import { warn } from '@ember/debug';

export default Controller.extend({
  sizeOptions: Object.freeze([5, 10, 20, 50, 100, 200]),
  size: 10,
  page: 0,
  sort: '-session-dates', // By default sort from newest to oldest

  actions: {
    selectSize(size) {
      this.set('size', size);
    },
    filterAgendaitems(filter) {
      this.set('page', 0);
      this.set('searchText', filter.searchText);
      this.set('mandatees', filter.mandatees);
      this.set('dateFrom', filter.dateFrom);
      this.set('dateTo', filter.dateTo);
      this.set('announcementsOnly', filter.announcementsOnly);
    },
    navigateToAgendaitem(searchEntry) {
      if (searchEntry.meetingId) {
        this.transitionToRoute('agenda.agendaitems.agendaitem', searchEntry.meetingId, searchEntry.id, {
          queryParams: { selectedAgenda: searchEntry.agendaId }
        });
      } else {
        warn(`Agendaitem ${searchEntry.id} is not related to a meeting. Cannot navigate to detail`, { id: 'agendaitem.no-meeting' });
      }
    }
  }
});
