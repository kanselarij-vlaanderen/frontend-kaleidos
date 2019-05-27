import Component from '@ember/component';
import DocumentsSelectorMixin from 'fe-redpencil/mixins/documents-selector-mixin';
import { getCachedProperty } from 'fe-redpencil/mixins/edit-agendaitem-or-subcase';

const decidedID = "4ea2c010-06c0-4594-966b-2cb9ed1e07b7"

export default Component.extend(DocumentsSelectorMixin, {
	classNames: ["vl-form__group vl-u-bg-porcelain"],
	propertiesToSet: ['approved', 'description', 'title'],

	description: getCachedProperty('description'),
	title: getCachedProperty('title'),
	approved: getCachedProperty('approved'),

	async setDecisionPhaseToSubcase() {
		const approved = await this.get('approved');
		const subcase = await this.get('subcase')

		const foundDecidedPhases = await this.store.query('subcase-phase', {
			filter: { code: { id: decidedID }, subcase: { id: subcase.get('id') } }
		})

		if (foundDecidedPhases && foundDecidedPhases.length > 0) {
			await Promise.all(foundDecidedPhases.map((phase) => phase.destroyRecord()));
		}
		if (approved) {
			const decidedCode = await this.store.findRecord('subcase-phase-code', decidedID);
			const newDecisionPhase = this.store.createRecord('subcase-phase', {
				date: new Date(),
				code: decidedCode,
				subcase: subcase
			});
			return newDecisionPhase.save();
		}
	},

	actions: {
		async saveChanges() {
			const { isAgendaItem } = this;
			const item = await this.get('item');
			item.set('modified', new Date());

			if (isAgendaItem && !item.showAsRemark) {
				const isDesignAgenda = await item.get('isDesignAgenda');
				if (isDesignAgenda) {
					const agendaitemSubcase = await item.get('subcase');
					agendaitemSubcase.set('modified', new Date());
					await this.setNewPropertiesToModel(agendaitemSubcase);
				}
				await this.setNewPropertiesToModel(item).then(async () => {
					const agenda = await item.get('agenda');
					this.updateModifiedProperty(agenda);
					item.reload();
				});
			} else {
				await this.setNewPropertiesToModel(item);
				const agendaitemsOnDesignAgendaToEdit = await item.get('agendaitemsOnDesignAgendaToEdit');
				if (agendaitemsOnDesignAgendaToEdit && agendaitemsOnDesignAgendaToEdit.get('length') > 0) {
					await Promise.all(agendaitemsOnDesignAgendaToEdit.map(async (agendaitem) => {
						await this.setNewPropertiesToModel(agendaitem).then(async () => {
							const agenda = await item.get('agenda');
							this.updateModifiedProperty(agenda).then((agenda) => {
								agenda.reload();
							});
							item.reload();
						});
					}));
				}
			}
			await this.setDecisionPhaseToSubcase();
			this.toggleProperty('isEditing');
		}
	}
});
