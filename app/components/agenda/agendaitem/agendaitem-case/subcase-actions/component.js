import Component from '@ember/component';
import { EditAgendaitemOrSubcase } from 'fe-redpencil/mixins/edit-agendaitem-or-subcase';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import ApprovalsEditMixin from 'fe-redpencil/mixins/approvals-edit-mixin';

export default Component.extend(EditAgendaitemOrSubcase, isAuthenticatedMixin, ApprovalsEditMixin, {
  classNames: ["vl-u-spacer-extended-bottom-l"],
  propertiesToSet: ['approvals'],

  actions: {
    async saveChanges() {
      this.set('isLoading', true);
      const { item } = this;
      await Promise.all(item.get('approvals').map(async (approval) => {
        return await approval.save();
      }));
      const agenda = await item.get('agenda');
      if (agenda) {
        await this.updateModifiedProperty(agenda);
      }
      this.set('isLoading', false);
      this.toggleProperty('isEditing');
    },

    async cancelEditing() {
      this.set('isLoading', true);
      const { item } = this;
      const approvals = await item.get('approvals');
      approvals.map((approval) => {
        approval.rollbackAttributes();
      });
      this.set('isLoading', false);
      this.toggleProperty('isEditing');
    },

    async toggleIsEditing() {
      this.set('isLoading', true);
      await this.checkForActionChanges();
      this.set('isLoading', false);
      this.toggleProperty('isEditing');
    }
  }
});
