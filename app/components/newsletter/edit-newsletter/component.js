import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({
	store:inject(),

	date: computed('selectedMeeting.newsletter.publicationDate', function() {
		const {selectedMeeting} = this;
		return new Date(selectedMeeting.get('newsletter.publicationDate'))
	}),

	docDate: computed('selectedMeeting.newsletter.publicationDocDate', function() {
		const {selectedMeeting} = this;
		return new Date(selectedMeeting.get('newsletter.publicationDocDate'))
	}),

	actions: {
		async saveChanges(meeting) {
			const newsletter = await meeting.get('newsletter')
			await newsletter.save();
			meeting.belongsTo('newsletter').reload();
			this.close();
		},

		async close() {
			const {selectedMeeting} = this;
			const newsletter = await selectedMeeting.get('newsletter')
			newsletter.rollbackAttributes();
			this.close();
		},

		selectDate(date) {
			this.get('selectedMeeting').set('newsletter.publicationDate', date);
		},

		selectDocDate(date) {
			this.get('selectedMeeting').set('newsletter.publicationDocDate', date);
		}
	}
});
