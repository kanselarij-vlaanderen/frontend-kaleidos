import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
	store: inject(),
	subcase: null,
	isEditing: false,
	classNames: ["vl-u-spacer--large"],

	actions: {
		async saveChanges() {
			const { approvals } = this;
			await Promise.all(approvals.map(async (approval) => {
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
			if (approvals && approvals.get('length') > 0) {
				this.toggleProperty('isEditing');
			} else {
				const mandatees = await subcase.get('mandatees');
				const date = new Date();
				await Promise.all(mandatees.map(async (mandatee) => {
					const approvalToCreate = this.store.createRecord('approval', {
						mandatee: mandatee,
						subcase: subcase,
						created: date,
						modified: date,
					})
					return await approvalToCreate.save();
				}))
				this.toggleProperty('isEditing');
			}
		}
	}
});
