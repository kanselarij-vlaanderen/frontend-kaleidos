import Component from '@ember/component';
import { inject } from '@ember/service';
export default Component.extend({
	store:inject(),

	actions: {
		createSingleNewsLetter() {
			const { title, subtitle, date, docDate, selectedMeeting } = this;
			const newsletter = this.store.createRecord('newsletter-info', {
				meeting: selectedMeeting,
				title: title,
				subtitle: subtitle,
				publicationDate: new Date(date),
				publicationDocDate:new Date(docDate)
			})
			newsletter.save().then(() => {
				this.close();
			});
		},

		close() {
			const {selectedMeeting} = this;
			selectedMeeting.rollbackAttributes();
			this.close();
		},

		selectDate(date) {
			this.set('date', date);
		},

		selectDocDate(date) {
			this.set('docDate', date);
		}
	}
});
