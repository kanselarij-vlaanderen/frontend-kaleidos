import Component from '@ember/component';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject } from '@ember/service';
import { task } from 'ember-concurrency';
import { isPresent } from '@ember/utils';

export default Component.extend({
  sessionService: inject(),
  currentSessionService: inject('current-session'),
  agendaService: inject(),
  classNames: ['vlc-agenda-items'],
  classNameBindings: ['getClassNames'],
  selectedAgendaItem: alias('sessionService.selectedAgendaItem'),
  agendaitems: null,
  isShowingChanges: null,
  overviewEnabled: null,
  isReAssigningPriorities: null,
  dragHandleClass: '.vlc-agenda-detail-sidebar__sub-item',
  getClassNames: computed('selectedAgendaItem', function () {
    if (this.get('selectedAgendaItem')) {
      return 'vlc-agenda-items--small';
    }
    return 'vl-u-spacer-extended-l vlc-agenda-items--spaced';
  }),

  reAssignPriorities: task(function* (agendaitems) {
    yield agendaitems.map(async (item) => {
      if (isPresent(item.changedAttributes().priority)) {
        this.set('isReAssigningPriorities', true);
        await item.save();
        if (!this.isDestroyed) {
          this.set('isReAssigningPriorities', false);
        }
      }
    });
  }).restartable(),

  actions: {
    selectAgendaItem(agendaitem) {
      this.selectAgendaItem(agendaitem);
    },

    toggleChangesOnly() {
      this.toggleProperty('isShowingChanges');
    },

    reorderItems(itemModels) {
      if (!this.currentSessionService.isEditor) {
        return;
      }
      itemModels.map((item, index) => {
        item.set('priority', index + 1);
      });
      this.reAssignPriorities.perform(itemModels);
      this.agendaService.groupAgendaItemsOnGroupName(itemModels);
    },

    reorderAnnouncements(itemModels) {
      if (!this.currentSessionService.isEditor) {
        return;
      }
      itemModels.map((item, index) => {
        item.set('priority', index + 1);
      });
      this.reAssignPriorities.perform(itemModels);
      // this.refresh();
      this.set('announcements', itemModels);
    },
  },
});
