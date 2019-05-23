import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({
	store: inject(),

	date: computed('newsletter.publicationDate', function () {
		const { selectedMeeting } = this;
		return new Date(selectedMeeting.get('newsletter.publicationDate'))
	}),

	docDate: computed('newsletter.publicationDocDate', function () {
		const { selectedMeeting } = this;
		return new Date(selectedMeeting.get('newsletter.publicationDocDate'))
	}),

	actions: {
		async saveChanges(meeting) {
			const newsletter = await this.get('newsletter');
			await newsletter.save();
			meeting.belongsTo('newsletter').reload();
			this.close();
		},

		async close() {
			const { selectedMeeting } = this;
			const newsletter = await selectedMeeting.get('newsletter');
			newsletter.rollbackAttributes();
			this.close();
		},

		async selectDate(date) {
			const newsletter = await this.get('newsletter');
			await newsletter.set('publicationDate', date);
		},

		async selectDocDate(date) {
			const newsletter = await this.get('newsletter');
			await newsletter.set('publicationDocDate', date);
		}
	}
});
