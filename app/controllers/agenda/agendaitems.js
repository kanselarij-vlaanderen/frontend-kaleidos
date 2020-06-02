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

  sortedAgendaitems: computed('agendaitems.@each.{priority,isDeleted}', async function () {
    const actualAgendaitems = this.get('agendaitems').filter((item) => !item.showAsRemark && !item.isDeleted).sortBy('priority');
    await this.agendaService.groupAgendaItemsOnGroupName(actualAgendaitems);
    return actualAgendaitems;
  }),

  sortedAnnouncements: computed('announcements.@each.{priority,isDeleted}', async function () {
    const announcements = this.get('announcements');
    if (announcements) {
      const actualAnnouncementsitems = announcements.filter((item) => !item.isDeleted).sortBy('priority');
      await this.agendaService.groupAgendaItemsOnGroupName(actualAnnouncementsitems);
      return actualAnnouncementsitems;
    } else {
      return [];
    }
  }),

  agendaitemsClass: computed('routing.currentRouteName', function () {
    const { routing } = this;
    if (routing.get('currentRouteName') === 'agenda.agendaitems.agendaitem') {
      return 'vlc-panel-layout__agenda-items';
    } else {
      return 'vlc-panel-layout-agenda__detail vl-u-bg-porcelain';
    }
  }),

  isOverviewWindow: computed('routing.currentRouteName', function () {
    const { routing } = this;
    return routing.get('currentRouteName') === 'agenda.agendaitems.index';
  }),

  actions: {
    selectAgendaItem(agendaitem) {
      const { currentAgenda } = this;
      this.set('sessionService.selectedAgendaItem', agendaitem);
      this.transitionToRoute('agenda.agendaitems.agendaitem', agendaitem.get('id'), {
        queryParams: {
          selectedAgenda: currentAgenda.id,
          refresh: null
        },
      });
    },
    searchAgendaItems(value) {
      this.set('filter', value);
    },
    refresh(id) {
      const { currentAgenda, currentSession } = this;
      this.transitionToRoute('agenda.agendaitems.index', currentSession.id, {
        queryParams: {
          selectedAgenda: currentAgenda.id,
          refresh: id
        },
      });
    },
  }
});
