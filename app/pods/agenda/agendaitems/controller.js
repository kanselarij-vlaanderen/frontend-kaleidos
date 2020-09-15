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
  selectedAgendaitem: alias('sessionService.selectedAgendaitem'),
  currentAgenda: alias('sessionService.currentAgenda'),
  currentSession: alias('sessionService.currentSession'),

  sortedAgendaitems: computed('agendaitems.@each.{priority,isDeleted}', async function() {
    const actualAgendaitems = this.get('agendaitems').filter((agendaitem) => !agendaitem.showAsRemark && !agendaitem.isDeleted)
      .sortBy('priority');
    await this.agendaService.groupAgendaitemsOnGroupName(actualAgendaitems);
    return actualAgendaitems;
  }),

  sortedAnnouncements: computed('announcements.@each.{priority,isDeleted}', function() {
    const announcements = this.get('announcements');
    if (announcements) {
      return announcements.filter((announcement) => !announcement.isDeleted).sortBy('priority');
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
    searchAgendaitems(value) {
      this.set('filter', value);
    },
    refresh() {
      this.send('reloadModel');
    },
  },
});
