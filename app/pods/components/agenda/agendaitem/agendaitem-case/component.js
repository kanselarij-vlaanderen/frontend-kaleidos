import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed, set } from '@ember/object';

export default Component.extend({
  authentication: inject('currentSession'),
  agendaitem: null,
  isEditing: false,

  subcase: computed('agendaitem', async function () {
    const agendaActivity = await this.agendaitem.get('agendaActivity');
    if (agendaActivity) {
      return await agendaActivity.get('subcase');
    } else {
      return null;
    }
  }),

  subcases: computed('agendaitem', async function () {
    const subcase = await this.get('subcase');
    return await subcase.get('subcasesFromCase');
  }),

  actions: {
    cancelEditing() {
      set(this, 'isEditing', false);
    },

    toggleIsEditing() {
      this.toggleProperty('isEditing');
    },
  }
});
