import Component from '@ember/component';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';
import { EditAgendaitemOrSubcase } from 'fe-redpencil/mixins/edit-agendaitem-or-subcase';

export default Component.extend(EditAgendaitemOrSubcase, {
  store: inject(),
  sessionService: inject(),
  currentSession: alias('sessionService.currentSession'),
  authentication: inject('currentSession'),
  editable: null,
  agendaitem: null,
  subcase: null,
  isRemark: alias('item.showAsRemark'),

  item: computed('agendaitem', 'subcase', function () {
    const { agendaitem, subcase } = this;
    if (agendaitem) {
      return agendaitem;
    } else {
      return subcase;
    }
  }),

  subcases: computed('item', async function () {
    const { isAgendaItem, isSubcase } = this;
    if (isAgendaItem) {
      const subcase = await this.get('item.subcase');
      return subcase.get('subcasesFromCase');
    } else if (isSubcase) {
      return this.get('item.subcasesFromCase');
    }
  }),

  actions: {
    cancelEditing() {
      this.toggleProperty('isEditing');
    },
    toggleConfidential(value) {
      this.set('item.confidential', value);
    },
    chooseConfidentiality(confidentiality) {
      this.get('item').set('confidentiality', confidentiality);
    },

    refreshRoute() {
      this.refreshRoute();
    }
  }
});
