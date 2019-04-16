import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({
	store: inject(),
	meeting: null,
	startDate: null,
	announcements: null,
	others: null,
	text:"",

	nextMeeting: computed('meeting.notes', function() {
		return this.get('meeting.notes').then((notes) => {
			return notes.get('nextMeeting');
		})
	}),

	actions: {
		close() {
			this.close();
		},

		createMeetingNotes(meeting) {
			const { selectedMandatees, startDate, announcements, others, text } = this;
			const meetingRecord = this.store.createRecord('meeting-record',
				{
					attendees: selectedMandatees,
					created: startDate || new Date(),
					modified: startDate || new Date(),
					announcements: announcements,
					others: others,
					description: text,
					meeting: meeting
				});
			meetingRecord.save().then(() => {
				this.close();
			})
		},

		selectStartDate(val) {
			this.set('startDate', val);
		},

		peopleSelected(mandatees) {
			this.set('selectedMandatees', mandatees);
		},

		saveChanges(notes) {
			const notesToSave = this.store.peekRecord('meeting-record', notes.get('id'));
			notesToSave.save().then(() => {
				this.close();
			});
		}
	}
});
