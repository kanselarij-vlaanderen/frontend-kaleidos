import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({
	classNames:["vl-form__group vl-u-bg-porcelain"],
	store:inject(),
	isEditing:false,

	decided: computed('agendaitem.decision', function() {
		return this.get('agendaitem.decision').get('approved');
	}),

	actions: {
		toggleIsEditing() {
			this.toggleProperty('isEditing');
		},
		async saveChanges(agendaitem) {
			const decisionToEdit = await agendaitem.get('decision');
			decisionToEdit.set('approved', this.get('decided'));
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
