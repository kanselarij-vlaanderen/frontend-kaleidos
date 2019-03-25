import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import moment from 'moment';

export default Component.extend({
	store: inject(),
	classNames: ["vlc-page-header"],
	isAssigningToAgenda: false,

	meetings: computed('store', function() {
		const dateOfToday = moment().format();
		const dateInTwoWeeks = moment().add(2, 'weeks').format();

		return this.store.query('meeting', {
			filter: { ':gte:planned-start': dateOfToday, ':lte:planned-start': dateInTwoWeeks },
			sort: 'planned-start'
		})
	}),

	actions: {
		proposeForAgenda(subcase, meeting) {
			subcase.set('requestedForMeeting', meeting);
			subcase.save();
		},
		proposeForOtherAgenda(subcase) {
			this.toggleProperty('isAssigningToAgenda');
			this.set('selectedSubcase', subcase);
		},
		unPropose(subcase) {
			subcase.set('requestedForMeeting', null);
			subcase.save();
		},
		cancel() {
			this.toggleProperty('isAssigningToAgenda');
			this.set('selectedSubcase', null);
		}		
	}
});
