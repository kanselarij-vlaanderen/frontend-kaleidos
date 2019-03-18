import Component from '@ember/component';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';
export default Component.extend({
	store: inject(),
	sessionService: inject(),
	classNames: ["vlc-container"],
	isEditing: false,

	currentSession: alias('sessionService.currentSession'),

	actions: {
		async toggleIsEditing() {
			const agendaitemNotes = this.get('agendaitem').get('notes');

			if (!agendaitemNotes) {
				const meetingRecord = this.store.createRecord('meeting-record', {
					created: new Date(),
					modified: new Date(),
					announcements: null,
					others: null,
					description: "",
					attendees: [],
					agendaitem: this.get('agendaitem'),
					meeting: null
				})
				await meetingRecord.save()
			}
			this.toggleProperty('isEditing');
		},

		async saveChanges(meetingRecord) {
			const recordToSave = this.store.peekRecord('meeting-record', meetingRecord.get('id'));
			await recordToSave.save();
			this.toggleProperty('isEditing');
		}
	}
});
