import Component from '@ember/component';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject } from '@ember/service';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import { task } from 'ember-concurrency';
import { isPresent } from '@ember/utils';
export default Component.extend(isAuthenticatedMixin, {
  sessionService: inject(),
  classNames: ['vlc-agenda-items-new'],
  classNameBindings: ['getClassNames'],
  selectedAgendaItem: alias('sessionService.selectedAgendaItem'),
  agendaitems: null,
  isEditingOverview: null,
  isShowingChanges: null,

  getClassNames: computed('selectedAgendaItem', function() {
    if (this.get('selectedAgendaItem')) {
      return 'vlc-agenda-items--small';
    } else {
      return 'vl-u-spacer-extended-l vlc-agenda-items-new--spaced';
    }
  }),

  reAssignPriorities: task(function*(agendaitemGroup) {
    yield agendaitemGroup.agendaitems.map((item) => {
      if (isPresent(item.changedAttributes().priority)) {
        return item.save();
      }
    });
  }).restartable(),

  actions: {
    selectAgendaItem(agendaitem) {
      this.selectAgendaItem(agendaitem);
    },

    toggleIsEditingOverview() {
      this.toggleProperty('isEditingOverview');
    },

    toggleChangesOnly() {
      this.toggleProperty('isShowingChanges');
    },

    async reorderItems(agendaitemGroup, reOrderedAgendaitemGroup, itemDragged) {
      if (this.isEditor || this.isAdmin) {
        const firstItem = agendaitemGroup.agendaitems.get('firstObject');
        const firstPrio = firstItem.get('priority');
        const newIndex = reOrderedAgendaitemGroup.indexOf(itemDragged);

        for (let i = 0; i < reOrderedAgendaitemGroup.get('length'); i++) {
          const reOrderedAgendaitem = reOrderedAgendaitemGroup.objectAt(i);
          const agendaitem = agendaitemGroup.agendaitems.find(
            (item) => item.id === reOrderedAgendaitem.get('id')
          );
          const newPrio = i + firstPrio;
          const draggedPrio = newIndex + firstPrio;
          const agendaitemPrio = agendaitem.get('priority');
          if (newPrio != draggedPrio) {
            if (agendaitemPrio != newPrio) {
              agendaitem.set('priority', newPrio);
            }
          } else {
            if (agendaitemPrio != draggedPrio) {
              agendaitem.set('priority', draggedPrio);
            }
          }
        }
        this.reAssignPriorities.perform(agendaitemGroup);
        agendaitemGroup.set('agendaitems', agendaitemGroup.agendaitems.sortBy('priority'));
      }
    },
  },
});
