import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
	classNames:["vl-form__group vl-u-bg-porcelain"],
	store:inject(),
	isEditing:false,

	actions: {
		toggleIsEditing() {
			this.toggleProperty('isEditing');
		},
		async saveChanges(agendaitem) {
			const decisionToEdit = await agendaitem.get('decision');
			await decisionToEdit.save();
			agendaitem.belongsTo('decision').reload();
			this.toggleProperty('isEditing');
		},
		async cancelEditing(agendaitem) {
			const decision = await agendaitem.get('decision')
			decision.rollbackAttributes();
			this.toggleProperty('isEditing');
		}
	}
});
