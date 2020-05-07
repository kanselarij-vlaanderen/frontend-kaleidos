import Component from '@ember/component';
import { inject } from '@ember/service';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import { computed } from '@ember/object';

export default Component.extend(isAuthenticatedMixin, {
  classNames: ['vl-u-spacer'],
  store: inject(),
  isEditing: false,
  agendaitem: null,
  subcase: null,
  isVerifyingDelete: null,
  decisionToDelete: null,

  item: computed('subcase.decision', function () {
    return this.get('subcase.decision');
  }),

  signedDocument: computed('decision.signedDocument', async function () {
    return await this.get('decision.signedDocument');
  }),

  async addDecision(subcase) {
    let decision = this.store.createRecord('decision', {
      subcase: await subcase,
      title: await subcase.get('title'),
      shortTitle: await subcase.get('shortTitle'),
      approved: false
    });
    subcase.set('decision', decision);
  },

  actions: {
    async toggleIsEditing() {
      const { subcase } = this;
      const decision = await subcase.get('decision');
      if (!decision) {
        await this.addDecision(subcase);
      } else if (decision.get('title') === '') {
        decision.set('title', subcase.get('title'));
      }
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
