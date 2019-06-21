import Mixin from '@ember/object/mixin';
import { inject } from '@ember/service';
import moment from 'moment';

export default Mixin.create({
	store: inject(),

	async checkForActionChanges() {
		try {

			const item = await this.get('item');
			const approvals = await item.get('approvals');
			const mandatees = await item.get('mandatees');
			const mandateesAlreadyAdded = await Promise.all(approvals.map(async (approval) => await approval.get('mandatee')));

			await this.createMissingApprovals(mandatees, mandateesAlreadyAdded, item);
			await this.deleteApprovals(mandateesAlreadyAdded, mandatees, approvals);
			await item.hasMany('approvals').reload();

		} catch {
			console.error('Something went wrong with the edit for the approvals.')
		}
	},

	modelIsAgendaItem(model) {
		const modelName = model.get('constructor.modelName')
		return modelName === 'agendaitem';
	},

	async createMissingApprovals(mandatees, mandateesAlreadyAdded, item) {
		const date = moment().utc().toDate();
		return Promise.all(mandatees.map(async (mandatee) => {
			const indexOf = mandateesAlreadyAdded.indexOf(mandatee);
			if (indexOf == -1) {
				const approvalToCreate = this.store.createRecord('approval', {
					mandatee: mandatee,
					created: date,
					modified: date,
				})
				if (this.modelIsAgendaItem(item)) {
					approvalToCreate.set('agendaitem', item);
					return approvalToCreate.save();
				} else {
					approvalToCreate.set('subcase', item);
					return approvalToCreate.save();
				}
			}
		}))
	},

	async deleteApprovals(mandateesAlreadyAdded, mandatees, approvals) {
		let mandateesProcessed = [];
		await Promise.all(approvals.map(async (approval) => {
			const mandatee = await approval.get('mandatee');
			if (!mandatee) {
				approval.destroyRecord();
			}
		}));
		return await Promise.all(mandateesAlreadyAdded.map(mandateeAdded => {
			if (mandateeAdded) {
				const foundMandatee = mandatees.find(mandatee => mandateeAdded.get('id') === mandatee.get('id'));
				if (!foundMandatee) {
					const approvalToDelete = approvals.find((approval) => approval.get('mandatee.id') == mandateeAdded.get('id'));
					approvalToDelete.destroyRecord();
				} else {
					mandateesProcessed.push(foundMandatee);
				}
			}
		}))
	},
});
