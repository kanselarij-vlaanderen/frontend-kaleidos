import Component from '@ember/component';
import { inject } from '@ember/service';
import { alias, not } from '@ember/object/computed';
import { computed, set } from '@ember/object';

export default Component.extend({
  store: inject(),
  sessionService: inject(),
  currentSession: alias('sessionService.currentSession'),
  authentication: inject('currentSession'),
  editable: null,
  agendaitem: null,
  subcase: null,
  isRemark: alias('item.showAsRemark'),
  isEditing: false,

  isAgendaItem: computed('item.contructor', function () {
    const { item } = this;
    return item.get('modelName') === 'agendaitem';
  }),

  isSubcase: not('isAgendaItem'),

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

    return null;
  }),

  actions: {
    cancelEditing() {
      set(this, 'isEditing', false);
    },

    toggleConfidential(value) {
      this.set('item.confidential', value);
    },

    toggleIsEditing() {
      this.toggleProperty('isEditing');
    },

    chooseConfidentiality(confidentiality) {
      this.get('item').set('confidentiality', confidentiality);
    },

    refreshRoute() {
      this.refreshRoute();
    }
  }
});
