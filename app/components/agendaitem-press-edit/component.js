import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
	classNames:["vl-form__group vl-u-bg-porcelain"],
	store:inject(),
	actions: {
		toggleIsEditing() {
			this.toggleProperty('isEditing');
		},
		async saveChanges(agendaitem) {
			await agendaitem.save();
			this.toggleProperty('isEditing');
		},
		async cancelEditing(agendaitem) {
			agendaitem.rollbackAttributes();
			this.toggleProperty('isEditing');
		}
	}
});
