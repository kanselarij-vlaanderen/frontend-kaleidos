import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
  store:inject(),
  classNames:["vl-form__group vl-u-bg-porcelain"],
  isEditing:false,

	actions: {
		toggleIsEditing() {
			this.toggleProperty('isEditing');
		},
		async saveChanges(agendaitem) {
      const newsletterToEdit = await agendaitem.get('newsletterInfo');
			await newsletterToEdit.save();
			this.toggleProperty('isEditing');
		},
		async cancelEditing(agendaitem) {
			const newsletter = await agendaitem.get('newsletterInfo');
			newsletter.rollbackAttributes();
			this.toggleProperty('isEditing');
		}
	}
});
