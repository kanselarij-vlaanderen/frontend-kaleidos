import Component from '@ember/component';
import { inject } from '@ember/service';
import { EditAgendaitemOrSubcase } from '../../../../../mixins/edit-agendaitem-or-subcase';

export default Component.extend(EditAgendaitemOrSubcase, {
	store: inject(),
	classNames: ["vl-u-spacer--large"],
	propertiesToSet: ['approvals'],

	modelIsAgendaItem(model) {
		const modelName = model.get('constructor.modelName')
		return modelName === 'agendaitem';
	},

	async createMissingApprovals(mandatees, mandateesAlreadyAdded, item) {
		const date = new Date();
		return Promise.all(mandatees.map(async (mandatee) => {
			const indexOf = mandateesAlreadyAdded.indexOf(mandatee);
			if (indexOf == -1) {
				if (this.modelIsAgendaItem(item)) {
					const approvalToCreate = this.store.createRecord('approval', {
						mandatee: mandatee,
						agendaitem: item,
						created: date,
						modified: date,
					})
					return approvalToCreate.save();
				} else {
					const approvalToCreate = this.store.createRecord('approval', {
						mandatee: mandatee,
						subcase: item,
						created: date,
						modified: date,
					})
					return approvalToCreate.save();
				}
			}
		}))
	},

	async deleteApprovals(mandateesAlreadyAdded, mandatees, approvals) {
		return Promise.all(mandateesAlreadyAdded.map(async mandateeAdded => {
			const foundMandatee = await mandatees.find(mandatee => mandateeAdded.get('id') === mandatee.get('id'));
			if (!foundMandatee) {
				const approvalToDelete = await approvals.find((approval) => approval.get('mandatee.id') == mandateeAdded.get('id'));
				approvalToDelete.destroyRecord();
			}
		}))
	},

	actions: {
		async saveChanges() {
			const { item } = this;
			await Promise.all(item.get('approvals').map(async (approval) => {
				return await approval.save();
			}));
			this.toggleProperty('isEditing');
		},

		async cancelEditing() {
			const { item } = this;
			const approvals = await item.get('approvals');
			approvals.map((approval) => {
				approval.rollbackAttributes();
			});
			this.toggleProperty('isEditing');
		},

		async toggleIsEditing() {
			const { item } = this;
			const approvals = await item.get('approvals');
			const mandatees = await item.get('mandatees');
			const mandateesAlreadyAdded = await Promise.all(approvals.map(async (approval) => await approval.get('mandatee')));

			await this.createMissingApprovals(mandatees, mandateesAlreadyAdded, item);
			await this.deleteApprovals(mandateesAlreadyAdded, mandatees, approvals);
			this.toggleProperty('isEditing');
		}
	}
});
