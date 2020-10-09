import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';

export default Controller.extend({
  queryParams: ['filter'],
  routing: inject('-routing'),
  filter: null,
  sessionService: inject(),
  agendaService: inject(),
  agendaitems: alias('model.agendaitems'),
  announcements: alias('model.announcements'),
  selectedAgendaItem: alias('sessionService.selectedAgendaItem'),
  currentAgenda: alias('sessionService.currentAgenda'),
  currentSession: alias('sessionService.currentSession'),

  sortedAgendaitems: computed('agendaitems.@each.{priority,isDeleted}', async function() {
    const actualAgendaitems = this.get('agendaitems').filter((item) => !item.showAsRemark && !item.isDeleted)
      .sortBy('priority');
    await this.agendaService.groupAgendaItemsOnGroupName(actualAgendaitems);
    return actualAgendaitems;
  }),

  // Async here is needed to have correct scrolling in sidebar when opening selected announcements
  // if not async, the agendaitems load after scrolling into position, pushing down the scroll position
  sortedAnnouncements: computed('announcements.@each.{priority,isDeleted}', async function() {
    const announcements = this.get('announcements');
    if (announcements) {
      return announcements.filter((item) => !item.isDeleted).sortBy('priority');
    }
    return [];
  }),

  agendaitemsClass: computed('routing.currentRouteName', function() {
    const {
      routing,
    } = this;
    if (routing.get('currentRouteName').startsWith('agenda.agendaitems.agendaitem')) {
      return 'vlc-panel-layout__agenda-items';
    }
    return 'vlc-panel-layout-agenda__detail vl-u-bg-porcelain';
  }),

  isOverviewWindow: computed('routing.currentRouteName', function() {
    const {
      routing,
    } = this;
    return routing.get('currentRouteName') === 'agenda.agendaitems.index';
  }),

  actions: {
    searchAgendaItems(value) {
      this.set('filter', value);
    },
    refresh() {
      this.send('reloadModel');
    },
  },
});
