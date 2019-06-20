import Component from '@ember/component';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';
import { EditAgendaitemOrSubcase } from 'fe-redpencil/mixins/edit-agendaitem-or-subcase';

export default Component.extend(EditAgendaitemOrSubcase, {
  store: inject('store'),
  sessionService: inject(),
  currentSession: alias('sessionService.currentSession'),
  authentication: inject('currentSession'),
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

  shouldShowDetails: computed('agendaitem', 'subcase', function () {
    const { agendaitem } = this;
    if (agendaitem) {
      return agendaitem.get('subcase');
    } else {
      return true;
    }
  }),

  subcases: computed('item', function () {
    return this.get('item.subcasesFromCase');
  }),

  actions: {
    cancelEditing() {
      this.toggleProperty('isEditing');
    },
    toggleConfidential(value) {
      this.set("item.confidential", value);
    },
    chooseConfidentiality(confidentiality) {
      this.get('item').set('confidentiality', confidentiality);
    }
  }
});
