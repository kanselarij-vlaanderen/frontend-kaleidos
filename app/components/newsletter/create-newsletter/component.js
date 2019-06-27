import Component from '@ember/component';
import { inject } from '@ember/service';
import moment from 'moment';

export default Component.extend({
	store: inject(),

	actions: {
		createSingleNewsLetter() {
			this.set('isLoading', true);
			const { title, subtitle, date, docDate, selectedMeeting } = this;
			const newsletter = this.store.createRecord('newsletter-info', {
				meeting: selectedMeeting,
				title: title,
				subtitle: subtitle,
				publicationDate: moment(date).utc().toDate(),
				publicationDocDate: moment(docDate).utc().toDate()
			})
			newsletter.save().then(() => {
				this.set('isLoading', false);
				this.close();
			});
		},

		close() {
			const { selectedMeeting } = this;
			selectedMeeting.rollbackAttributes();
			this.close();
		},

		selectDate(date) {
			this.set('date', moment(date).utc().toDate());
		},

		selectDocDate(date) {
			this.set('docDate', date);
		}
	}
});
