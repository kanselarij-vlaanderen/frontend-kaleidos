import Component from '@ember/component';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';
import { EditAgendaitemOrSubcase } from 'fe-redpencil/mixins/edit-agendaitem-or-subcase';

export default Component.extend(EditAgendaitemOrSubcase, {
  store: inject('store'),
  sessionService: inject(),
  currentSession: alias('sessionService.currentSession'),
  editable: null,
  agendaitem: null,

  item: computed('agendaitem', 'subcase', function () {
    const { agendaitem, subcase } = this;
    if (agendaitem) {
      return agendaitem;
    } else {
      return subcase;
    }
  }),

  actions: {
    cancelEditing() {
      this.toggleProperty('isEditing');
    }
  }
});
