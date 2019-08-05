import Component from '@ember/component';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

export default Component.extend(isAuthenticatedMixin, {
  router: inject(),
  tagName: 'a',

  classNameBindings: ['extraAgendaItemClass'],
  agendaItem: undefined,

  async click() {
    this.selectAgendaItem(this.agendaItem);
  },

  agendaitemPrio: computed('agendaItem', function() {
    if (!this.agendaItem) {
      return '';
    }
    const { priority, subPriority } = this.agendaItem;

    let priorityString = '';
    if (priority) {
      priorityString += priority;
    }
    if (subPriority) {
      priorityString += subPriority;
    }
    priorityString += '.';
    return priorityString;
  }),

  extraAgendaItemClass: computed('agendaItem.id', 'router.currentRoute', function() {
    const currentAgendaitemId = this.router.get('currentRoute.parent.params.agendaitem_id');
    if (currentAgendaitemId == this.get('agendaItem.id')) {
      return 'vlc-agenda-items-new__sub-item--active';
    }
  })
});
