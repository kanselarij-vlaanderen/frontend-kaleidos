import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
	store:inject(),
	classNames:['vl-u-spacer vl-col--3-4'],
	isShowingVersions:false, 
	isEditing:false,

	actions: {
		showDocuments() {
			this.toggleProperty('isShowingVersions');
		},
		toggleIsEditing() {
			this.toggleProperty('isEditing');
		},
		async saveChanges(agendaitem) {
			const newsletterToEdit = await this.store.peekRecord('newsletter-info', agendaitem.get('newsletterInfo.id'));
			await newsletterToEdit.save();
			this.toggleProperty('isEditing');
		},
		async cancelEditing(agendaitem) {
			const newsletter = await agendaitem.get('newsletterInfo')
			newsletter.rollbackAttributes();
			this.toggleProperty('isEditing');
		}
	}
});
