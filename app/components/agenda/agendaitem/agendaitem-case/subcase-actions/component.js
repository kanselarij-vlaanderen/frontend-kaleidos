import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
	store: inject(),
	subcase: null,
	isEditing: false,
	classNames: ["vl-u-spacer--large"],

	async createMissingApprovals(mandatees, mandateesAlreadyAdded, subcase) {
		const date = new Date();
		return Promise.all(mandatees.map(async (mandatee) => {
			const indexOf = mandateesAlreadyAdded.indexOf(mandatee);
			if (indexOf == -1) {
				const approvalToCreate = this.store.createRecord('approval', {
					mandatee: mandatee,
					subcase: subcase,
					created: date,
					modified: date,
				})
				return await approvalToCreate.save();
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
			const { subcase } = this;
			await Promise.all(subcase.get('approvals').map(async (approval) => {
				return await approval.save();
			}));
			this.toggleProperty('isEditing');
		},

		async cancelEditing() {
			const { subcase } = this;
			const approvals = await subcase.get('approvals');
			approvals.map((approval) => {
				approval.rollbackAttributes();
			});
			this.toggleProperty('isEditing');
		},

		async toggleIsEditing() {
			const { subcase } = this;
			const approvals = await subcase.get('approvals');
			const mandatees = await subcase.get('mandatees');
			const mandateesAlreadyAdded = await Promise.all(approvals.map(async (approval) => await approval.get('mandatee')));
			const approvalsLength = mandateesAlreadyAdded.get('length');
			const mandateeLength = mandatees.get('length');

			if (mandateeLength > approvalsLength) {
				await this.createMissingApprovals(mandatees, mandateesAlreadyAdded, subcase);
			} else {
				await this.deleteApprovals(mandateesAlreadyAdded, mandatees, approvals);
			}
			this.toggleProperty('isEditing');
		}
	}
});
