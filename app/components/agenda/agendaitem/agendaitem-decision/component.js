import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({
  classNames: ['vl-u-spacer'],
  store: inject(),
  currentSession: inject(),
  isEditing: false,
  agendaitem: null,
  subcase: null,
  isVerifyingDelete: null,
  decisionToDelete: null,

  signedDocument: computed('decision.signedDocument', async function () {
    return await this.get('decision.signedDocument');
  }),

  actions: {
    async toggleIsEditing() {
      this.toggleProperty('isEditing');
    },

    async deleteDecision(decision) {
      this.set('decisionToDelete', await decision);
      this.set('isVerifyingDelete', true);
    },

    async verify() {
      await this.decisionToDelete.destroyRecord();
      let agendaitemToUpdate;

      const subcase = await this.agendaitem.get('subcase');
      await subcase.get('decisions').reload();

      if (this.isTableRow) {
        agendaitemToUpdate = await this.agendaitem.content;
      } else {
        agendaitemToUpdate = await this.get('agendaitem');
      }
      await agendaitemToUpdate.save();
      if (!this.isDestroyed) {
        this.set('isVerifyingDelete', false);
      }
    },

    cancel() {
      this.set('decisionToDelete', null);
      this.set('isVerifyingDelete', false);
    }
  }
});
