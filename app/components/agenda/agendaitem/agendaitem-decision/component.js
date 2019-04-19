import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
  classNames: ['vlc-padding-bottom--large'],
	store: inject(),
	isEditing: false,
	agendaitem: null,

	async addDecision(agendaitem) {
		const agendaitemModel = await this.store.peekRecord('agendaitem', agendaitem.get('id'));
		let decision = this.store.createRecord("decision", {
			agendaitem: agendaitemModel,
			shortTitle: await agendaitem.get('subcase.shortTitle'),
		});
		await decision.save();
		await agendaitem.belongsTo('decision').reload();
	},

	actions: {
		async toggleIsEditing() {
			const { agendaitem } = this;
			const decision = await agendaitem.get('decision');
			if (!decision) {
				await this.addDecision(agendaitem);
			}
			this.toggleProperty('isEditing');
		}
	}
});
