import Component from '@ember/component';
import { EditAgendaitemOrSubcase } from 'fe-redpencil/mixins/edit-agendaitem-or-subcase';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import ApprovalsEditMixin from 'fe-redpencil/mixins/approvals-edit-mixin';

export default Component.extend(EditAgendaitemOrSubcase, isAuthenticatedMixin, ApprovalsEditMixin, {
	classNames: ["vl-u-spacer-extended-bottom-l"],
	propertiesToSet: ['approvals'],

	actions: {
		async saveChanges(approvals) {
			this.set('isLoading', true);
      const { item } = this;
			await Promise.all(approvals.map(async (approval) => {
        if(approval.changedAttributes()){
          return await approval.save();
        }
				
      }));
      // item.reload();
      // item.hasMany('approvals').reload();
			const agenda = await item.get('agenda');
			if (agenda) {
				await this.updateModifiedProperty(agenda);
			}
			this.set('isLoading', false);
			this.toggleProperty('isEditing');
		},
		async toggleApproved(approval) {
      await this.store.findRecord('approval', approval.id, { reload:false}).then(function(item) {
        const currentValue = approval.get('approved')
        item.set('approved', !currentValue);
        item.save();
      });
      // console.log(approval.get('approved'));
      // approval.set('approved', value);
      // await approval.save();
      // const agenda = await approval.get('agendaitem.agenda');
			// if (agenda) {
			// 	await this.updateModifiedProperty(agenda);
			// }
			// this.toggleProperty('isEditing');
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
			// this.set('isLoading', true);/
			// await this.checkForActionChanges();
			// this.set('isLoading', false);
			this.toggleProperty('isEditing');
		}
	}
});
