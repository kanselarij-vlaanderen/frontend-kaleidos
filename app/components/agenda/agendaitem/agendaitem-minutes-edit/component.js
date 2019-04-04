import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
	classNames:["vl-form__group vl-u-bg-porcelain"],
	store:inject(),

	actions: {
		async saveChanges(agendaitem) {
			const recordToSave = this.store.peekRecord('meeting-record', await agendaitem.get('meetingRecord.id'));
			await recordToSave.save();
			this.toggleProperty('isEditing');
		},
		async cancelEditing(agendaitem) {
			const meetingRecord = this.store.peekRecord('meeting-record', await agendaitem.get('meetingRecord.id'));
			meetingRecord.rollbackAttributes();
			this.toggleProperty('isEditing');
		}
	}
});
